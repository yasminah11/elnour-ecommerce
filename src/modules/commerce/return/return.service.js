import returnRequestModel from "../../../DB/models/returnRequest.model.js"
import returnItemModel from "../../../DB/models/returnItem.model.js"
import refundModel from "../../../DB/models/refund.model.js"
import orderModel from "../../../DB/models/order.model.js"
import orderItemModel from "../../../DB/models/orderItem.model.js"
import orderStatusHistoryModel from "../../../DB/models/orderStatusHistory.model.js"
import inventoryRecordModel from "../../../DB/models/inventoryRecord.model.js"
import inventoryAdjustmentModel from "../../../DB/models/inventoryAdjustment.model.js"
import * as db_service from "../../../DB/db.service.js"
import successResponse from "../../../common/utils/successes_response/succsses.response.js"
import { returnStatusEnum, refundStatusEnum } from "../../../common/enum/return.enum.js"
import { orderStatusEnum } from "../../../common/enum/order.enum.js"
import { actorModelEnum } from "../../../common/enum/audit.enum.js"
import { writeAudit } from "../../../common/utils/audit.util.js"

// FR-RET-01/02/03: only against the customer's own order. TBD-06: the exact
// eligibility WINDOW (number of days) is not decided, so it is intentionally
// not enforced here as a hard-coded cutoff — the request is accepted and the
// eligibility judgment happens at the Admin/Sales approval step (FR-RET-04).
export const createReturnRequest = async (req, res, next) => {
    const { order: orderId, reason, reasonDetails, evidenceUrls, items } = req.body

    const order = await db_service.findOne({ model: orderModel, check: { _id: orderId, user: req.auth._id } })
    if (!order) throw new Error("order NOT FOUND", { cause: 404 })

    const returnRequest = await db_service.create({
        model: returnRequestModel,
        dataa: { order: order._id, reason, reasonDetails, evidenceUrls }
    })

    for (const it of items) {
        const orderItem = await db_service.findOne({ model: orderItemModel, check: { _id: it.orderItem, order: order._id } })
        if (!orderItem) throw new Error("one of the order items is invalid for this order", { cause: 409 })
        await db_service.create({
            model: returnItemModel,
            dataa: { returnRequest: returnRequest._id, orderItem: orderItem._id, quantity: it.quantity }
        })
    }

    await orderModel.findByIdAndUpdate(order._id, { status: orderStatusEnum.returnRequested })
    await db_service.create({
        model: orderStatusHistoryModel,
        dataa: {
            order: order._id,
            actor: req.auth._id,
            actorModel: actorModelEnum.auth,
            oldStatus: order.status,
            newStatus: orderStatusEnum.returnRequested,
            reason: "customer requested a return"
        }
    })

    successResponse({ res, status: 201, message: "return request submitted", data: returnRequest })
}

// FR-RET-04: approval is manual, restricted (route-level) to Admin/Sales.
export const decide = async (req, res, next) => {
    const { id } = req.params
    const { status, reason } = req.body

    const returnRequest = await db_service.findById({ model: returnRequestModel, id })
    if (!returnRequest) throw new Error("return request NOT FOUND", { cause: 404 })

    returnRequest.status = status === "approved" ? returnStatusEnum.approved : returnStatusEnum.rejected
    returnRequest.reviewedBy = req.auth._id
    returnRequest.reviewedAt = new Date()
    await returnRequest.save()

    const newOrderStatus = status === "approved" ? orderStatusEnum.returnApproved : orderStatusEnum.delivered
    const order = await db_service.findById({ model: orderModel, id: returnRequest.order })
    if (order) {
        const oldStatus = order.status
        order.status = newOrderStatus
        await order.save()
        await db_service.create({
            model: orderStatusHistoryModel,
            dataa: { order: order._id, actor: req.auth._id, actorModel: actorModelEnum.staff, oldStatus, newStatus: newOrderStatus, reason }
        })
    }

    await writeAudit({
        actor: req.auth._id,
        actorModel: actorModelEnum.staff,
        action: "return.decision",
        targetType: "returnRequest",
        targetId: returnRequest._id,
        metadata: { status, reason }
    })

    successResponse({ res, message: `return request ${status}`, data: returnRequest })
}

// FR-RET-05: physical receipt/inspection. FR-INV-07: restockable items
// increment stock through the normal auditable InventoryAdjustment trail.
export const inspect = async (req, res, next) => {
    const { id } = req.params
    const { physicalReceiptState, items = [] } = req.body

    const returnRequest = await db_service.findById({ model: returnRequestModel, id })
    if (!returnRequest) throw new Error("return request NOT FOUND", { cause: 404 })

    returnRequest.physicalReceiptState = physicalReceiptState
    returnRequest.status = physicalReceiptState === "inspected" ? returnStatusEnum.inspected : returnStatusEnum.received
    await returnRequest.save()

    for (const it of items) {
        const returnItem = await db_service.findOne({ model: returnItemModel, check: { _id: it.returnItem, returnRequest: returnRequest._id } })
        if (!returnItem) continue
        returnItem.restockable = it.restockable
        await returnItem.save()

        if (it.restockable) {
            const orderItem = await db_service.findById({ model: orderItemModel, id: returnItem.orderItem })
            const inv = await db_service.findOne({ model: inventoryRecordModel, check: { variant: orderItem.variant } })
            if (inv) {
                const quantityAfter = inv.quantity + returnItem.quantity
                inv.quantity = quantityAfter
                await inv.save()
                await db_service.create({
                    model: inventoryAdjustmentModel,
                    dataa: {
                        inventoryRecord: inv._id,
                        actor: req.auth._id,
                        quantityChange: returnItem.quantity,
                        quantityAfter,
                        reason: "return accepted - restocked",
                        reference: returnRequest._id.toString()
                    }
                })
            }
        }
    }

    await writeAudit({
        actor: req.auth._id,
        actorModel: actorModelEnum.staff,
        action: "return.inspect",
        targetType: "returnRequest",
        targetId: returnRequest._id,
        metadata: { physicalReceiptState }
    })

    successResponse({ res, message: "return request inspected", data: returnRequest })
}

// FR-RET-06: refund method kept flexible (TBD-07).
export const createRefund = async (req, res, next) => {
    const { id } = req.params
    const { method, amount } = req.body

    const returnRequest = await db_service.findById({ model: returnRequestModel, id })
    if (!returnRequest) throw new Error("return request NOT FOUND", { cause: 404 })

    const existing = await db_service.findOne({ model: refundModel, check: { returnRequest: returnRequest._id } })
    if (existing) throw new Error("refund already exists for this return request", { cause: 409 })

    const refund = await db_service.create({
        model: refundModel,
        dataa: { returnRequest: returnRequest._id, method, amount }
    })

    successResponse({ res, status: 201, message: "refund created", data: refund })
}

// FR-RET-07: refund completion recorded separately from return approval.
export const completeRefund = async (req, res, next) => {
    const { id } = req.params

    const refund = await db_service.findById({ model: refundModel, id })
    if (!refund) throw new Error("refund NOT FOUND", { cause: 404 })

    refund.status = refundStatusEnum.completed
    refund.processedBy = req.auth._id
    refund.processedAt = new Date()
    await refund.save()

    const returnRequest = await db_service.findById({ model: returnRequestModel, id: refund.returnRequest })
    if (returnRequest) {
        returnRequest.status = returnStatusEnum.completed
        await returnRequest.save()

        const order = await db_service.findById({ model: orderModel, id: returnRequest.order })
        if (order) {
            const oldStatus = order.status
            order.status = orderStatusEnum.refunded
            await order.save()
            await db_service.create({
                model: orderStatusHistoryModel,
                dataa: { order: order._id, actor: req.auth._id, actorModel: actorModelEnum.staff, oldStatus, newStatus: orderStatusEnum.refunded, reason: "refund completed" }
            })
        }
    }

    await writeAudit({
        actor: req.auth._id,
        actorModel: actorModelEnum.staff,
        action: "refund.complete",
        targetType: "refund",
        targetId: refund._id,
        metadata: { amount: refund.amount, method: refund.method }
    })

    successResponse({ res, message: "refund completed", data: refund })
}
