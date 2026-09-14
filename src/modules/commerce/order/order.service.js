import { randomUUID } from "crypto"
import orderModel from "../../../DB/models/order.model.js"
import orderItemModel from "../../../DB/models/orderItem.model.js"
import orderStatusHistoryModel from "../../../DB/models/orderStatusHistory.model.js"
import paymentRecordModel from "../../../DB/models/paymentRecord.model.js"
import cartModel from "../../../DB/models/cart.model.js"
import cartItemModel from "../../../DB/models/cartItem.model.js"
import productVariantModel from "../../../DB/models/productVariant.model.js"
import inventoryRecordModel from "../../../DB/models/inventoryRecord.model.js"
import inventoryAdjustmentModel from "../../../DB/models/inventoryAdjustment.model.js"
import couponModel from "../../../DB/models/coupon.model.js"
import * as db_service from "../../../DB/db.service.js"
import successResponse from "../../../common/utils/successes_response/succsses.response.js"
import { orderStatusEnum } from "../../../common/enum/order.enum.js"
import { paymentStatusEnum } from "../../../common/enum/payment.enum.js"
import { writeAudit } from "../../../common/utils/audit.util.js"
import { actorModelEnum } from "../../../common/enum/audit.enum.js"

const generateOrderNumber = () => `ORD-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`

// FR-ORDER-01/05: checkout. FR-CART-03: stock/quantity re-validated here.
// FR-INV-02: online order events automatically update stock (this
// implementation reserves/decrements immediately on order placement, the
// exact reservation-vs-confirmation timing policy remains a TBD refinement).
export const checkout = async (req, res, next) => {
    const { fulfillmentMethod, paymentMethod, customerInfo, appliedCoupons = [], deliveryFee = 0 } = req.body

    const cart = await db_service.findOne({ model: cartModel, check: { user: req.auth._id } })
    if (!cart) {
        throw new Error("cart is empty", { cause: 409 })
    }
    const cartItems = await db_service.find({ model: cartItemModel, filteration: { cart: cart._id } })
    if (!cartItems.length) {
        throw new Error("cart is empty", { cause: 409 })
    }

    // FR-CART-03: re-check availability right before confirming the order.
    const inventoryByVariant = {}
    for (const ci of cartItems) {
        const inv = await db_service.findOne({ model: inventoryRecordModel, check: { variant: ci.variant } })
        if (!inv || inv.quantity < ci.quantity) {
            throw new Error("one or more items in your cart are no longer available in the requested quantity", { cause: 409 })
        }
        inventoryByVariant[ci.variant.toString()] = inv
    }

    let subtotal = 0
    const itemDrafts = []
    for (const ci of cartItems) {
        const variant = await db_service.findById({ model: productVariantModel, id: ci.variant, populate: ["product"] })
        const unitPrice = variant.price
        const lineTotal = unitPrice * ci.quantity
        subtotal += lineTotal
        itemDrafts.push({
            variant: variant._id,
            skuSnapshot: variant.sku,
            nameSnapshot: variant.product?.name,
            quantity: ci.quantity,
            unitPrice,
            lineTotal
        })
    }

    // FR-PROMO-06: reject invalid/expired/over-limit coupons.
    let discountTotal = 0
    for (const couponId of appliedCoupons) {
        const coupon = await db_service.findOne({ model: couponModel, check: { _id: couponId, isActive: true } })
        if (!coupon) throw new Error("invalid coupon", { cause: 409 })
        if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new Error("coupon expired", { cause: 409 })
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) throw new Error("coupon usage limit reached", { cause: 409 })

        discountTotal += coupon.discountType === "percentage"
            ? (subtotal * coupon.discountValue) / 100
            : coupon.discountValue

        coupon.usedCount += 1
        await coupon.save()
    }

    const taxTotal = 0 // TBD-10: legal tax/invoicing rules not finalized.
    const resolvedDeliveryFee = fulfillmentMethod === "delivery" ? deliveryFee : 0
    const grandTotal = Math.max(subtotal - discountTotal + resolvedDeliveryFee + taxTotal, 0)

    const order = await db_service.create({
        model: orderModel,
        dataa: {
            user: req.auth._id,
            orderNumber: generateOrderNumber(),
            fulfillmentMethod,
            paymentMethod,
            status: orderStatusEnum.pendingPayment,
            customerInfo,
            subtotal,
            discountTotal,
            deliveryFee: resolvedDeliveryFee,
            taxTotal,
            grandTotal,
            appliedCoupons
        }
    })

    for (const draft of itemDrafts) {
        await db_service.create({ model: orderItemModel, dataa: { order: order._id, ...draft } })
    }

    await db_service.create({
        model: orderStatusHistoryModel,
        dataa: {
            order: order._id,
            actor: req.auth._id,
            actorModel: actorModelEnum.auth,
            newStatus: orderStatusEnum.pendingPayment,
            reason: "order placed"
        }
    })

    await db_service.create({
        model: paymentRecordModel,
        dataa: { order: order._id, method: paymentMethod, status: paymentStatusEnum.pending, amount: grandTotal }
    })

    // FR-INV-02: decrement stock, one InventoryAdjustment per line (auditable).
    for (const draft of itemDrafts) {
        const inv = inventoryByVariant[draft.variant.toString()]
        const quantityAfter = inv.quantity - draft.quantity
        inv.quantity = quantityAfter
        await inv.save()
        await db_service.create({
            model: inventoryAdjustmentModel,
            dataa: {
                inventoryRecord: inv._id,
                actor: req.auth._id,
                quantityChange: -draft.quantity,
                quantityAfter,
                reason: "online order placed",
                reference: order.orderNumber
            }
        })
    }

    await db_service.deleteMany({ model: cartItemModel, check: { cart: cart._id } })

    successResponse({ res, status: 201, message: "order placed", data: { order, items: itemDrafts } })
}

export const myOrders = async (req, res, next) => {
    const orders = await db_service.find({ model: orderModel, filteration: { user: req.auth._id } })
    successResponse({ res, data: orders })
}

export const myOrderById = async (req, res, next) => {
    const { id } = req.params
    const order = await db_service.findOne({ model: orderModel, check: { _id: id, user: req.auth._id } })
    if (!order) throw new Error("order NOT FOUND", { cause: 404 })
    const items = await db_service.find({ model: orderItemModel, filteration: { order: order._id } })
    const history = await db_service.find({ model: orderStatusHistoryModel, filteration: { order: order._id } })
    successResponse({ res, data: { order, items, history } })
}

// FR-ORDER-07: customer cancellation, subject to the delivered-order rule.
export const cancelByCustomer = async (req, res, next) => {
    const { id } = req.params
    const { reason } = req.body

    const order = await db_service.findOne({ model: orderModel, check: { _id: id, user: req.auth._id } })
    if (!order) throw new Error("order NOT FOUND", { cause: 404 })
    if ([orderStatusEnum.delivered, orderStatusEnum.cancelled, orderStatusEnum.refunded].includes(order.status)) {
        throw new Error("this order can no longer be cancelled directly; please submit a return request instead", { cause: 409 })
    }

    await applyStatusChange({ order, newStatus: orderStatusEnum.cancelled, reason, actor: req.auth._id, actorModel: actorModelEnum.auth, restock: true })
    successResponse({ res, message: "order cancelled" })
}

// FR-ORDER-08: staff cancellation, reason required.
export const cancelByStaff = async (req, res, next) => {
    const { id } = req.params
    const { reason } = req.body

    const order = await db_service.findById({ model: orderModel, id })
    if (!order) throw new Error("order NOT FOUND", { cause: 404 })

    await applyStatusChange({ order, newStatus: orderStatusEnum.cancelled, reason, actor: req.auth._id, actorModel: actorModelEnum.staff, restock: true })
    successResponse({ res, message: "order cancelled" })
}

// FR-ORDER-09 / FR-FLOW-03 / BR-14: authorized employees move status
// backward or forward, always with an audit record.
export const changeStatus = async (req, res, next) => {
    const { id } = req.params
    const { newStatus, reason } = req.body

    const order = await db_service.findById({ model: orderModel, id })
    if (!order) throw new Error("order NOT FOUND", { cause: 404 })

    const restock = newStatus === orderStatusEnum.cancelled && order.status !== orderStatusEnum.cancelled
    await applyStatusChange({ order, newStatus, reason, actor: req.auth._id, actorModel: actorModelEnum.staff, restock })
    successResponse({ res, message: "order status updated", data: order })
}

// Shared status-transition core: writes the order, the append-only
// OrderStatusHistory row, the audit log entry (FR-ADMIN-08), and — only for
// a cancellation — restocks the reserved items.
const applyStatusChange = async ({ order, newStatus, reason, actor, actorModel, restock }) => {
    const oldStatus = order.status
    order.status = newStatus
    if (newStatus === orderStatusEnum.cancelled) {
        order.cancellationReason = reason
        order.cancelledBy = actor
        order.cancelledByModel = actorModel
    }
    await order.save()

    await db_service.create({
        model: orderStatusHistoryModel,
        dataa: { order: order._id, actor, actorModel, oldStatus, newStatus, reason }
    })

    if (restock) {
        const items = await db_service.find({ model: orderItemModel, filteration: { order: order._id } })
        for (const item of items) {
            const inv = await db_service.findOne({ model: inventoryRecordModel, check: { variant: item.variant } })
            if (!inv) continue
            const quantityAfter = inv.quantity + item.quantity
            inv.quantity = quantityAfter
            await inv.save()
            await db_service.create({
                model: inventoryAdjustmentModel,
                dataa: {
                    inventoryRecord: inv._id,
                    actor,
                    quantityChange: item.quantity,
                    quantityAfter,
                    reason: "order cancelled - stock restored",
                    reference: order.orderNumber
                }
            })
        }
    }

    await writeAudit({
        actor,
        actorModel,
        action: "order.statusChange",
        targetType: "order",
        targetId: order._id,
        metadata: { oldStatus, newStatus, reason }
    })
}
