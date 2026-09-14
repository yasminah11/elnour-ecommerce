import { randomUUID } from "crypto"
import invoiceModel from "../../../DB/models/invoice.model.js"
import invoiceItemModel from "../../../DB/models/invoiceItem.model.js"
import orderModel from "../../../DB/models/order.model.js"
import orderItemModel from "../../../DB/models/orderItem.model.js"
import exchangeRateModel from "../../../DB/models/exchangeRate.model.js"
import * as db_service from "../../../DB/db.service.js"
import successResponse from "../../../common/utils/successes_response/succsses.response.js"
import { currencyEnum } from "../../../common/enum/order.enum.js"
import { writeAudit } from "../../../common/utils/audit.util.js"
import { actorModelEnum } from "../../../common/enum/audit.enum.js"

const generateInvoiceNumber = () => `INV-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`

// FR-ORDER-10: an order is not fully completed without its invoice.
// FR-PAY-06 / TBD-03: if a USD invoice is requested, the currently active
// ExchangeRate is snapshotted onto the invoice — never recomputed later.
export const generateInvoice = async (req, res, next) => {
    const { id } = req.params
    const { currency = currencyEnum.egp } = req.body

    const order = await db_service.findById({ model: orderModel, id })
    if (!order) throw new Error("order NOT FOUND", { cause: 404 })

    const existing = await db_service.findOne({ model: invoiceModel, check: { order: order._id } })
    if (existing) throw new Error("invoice already exists for this order", { cause: 409 })

    let exchangeRateUsed = null
    if (currency === currencyEnum.usd) {
        const activeRate = await exchangeRateModel.findOne({ isActive: true }).sort({ effectiveAt: -1 })
        if (!activeRate) throw new Error("no active exchange rate configured (TBD-03)", { cause: 409 })
        exchangeRateUsed = activeRate.rate
    }

    const invoice = await db_service.create({
        model: invoiceModel,
        dataa: {
            order: order._id,
            invoiceNumber: generateInvoiceNumber(),
            currency,
            exchangeRateUsed,
            subtotal: order.subtotal,
            discountTotal: order.discountTotal,
            deliveryFee: order.deliveryFee,
            taxTotal: order.taxTotal,
            grandTotal: order.grandTotal,
            paymentMethod: order.paymentMethod,
            customerInfoSnapshot: { name: order.customerInfo.name, billingInfo: order.customerInfo.billingInfo }
        }
    })

    const orderItems = await db_service.find({ model: orderItemModel, filteration: { order: order._id } })
    for (const item of orderItems) {
        await db_service.create({
            model: invoiceItemModel,
            dataa: {
                invoice: invoice._id,
                orderItem: item._id,
                description: item.nameSnapshot || item.skuSnapshot,
                quantity: item.quantity,
                price: item.unitPrice,
                discount: 0,
                lineTotal: item.lineTotal
            }
        })
    }

    await writeAudit({
        actor: req.auth._id,
        actorModel: actorModelEnum.staff,
        action: "invoice.generate",
        targetType: "invoice",
        targetId: invoice._id,
        metadata: { order: order._id.toString() }
    })

    successResponse({ res, status: 201, message: "invoice generated", data: invoice })
}

export const myInvoice = async (req, res, next) => {
    const { orderId } = req.params
    const order = await db_service.findOne({ model: orderModel, check: { _id: orderId, user: req.auth._id } })
    if (!order) throw new Error("order NOT FOUND", { cause: 404 })

    const invoice = await db_service.findOne({ model: invoiceModel, check: { order: order._id } })
    if (!invoice) throw new Error("invoice NOT FOUND", { cause: 404 })

    const items = await db_service.find({ model: invoiceItemModel, filteration: { invoice: invoice._id } })
    successResponse({ res, data: { invoice, items } })
}
