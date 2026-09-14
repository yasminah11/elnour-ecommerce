import joi from "joi"
import { GeneralRules } from "../../../common/utils/generalRuels.js"
import { fulfillmentMethodEnum, paymentMethodEnum, orderStatusEnum } from "../../../common/enum/order.enum.js"

// FR-ORDER-01: checkout collects name, email, phone, city, address, billing
// info, fulfillment method, payment method.
export const checkoutSchema = {
    body: joi.object({
        fulfillmentMethod: joi.string().valid(...Object.values(fulfillmentMethodEnum)).required(),
        paymentMethod: joi.string().valid(...Object.values(paymentMethodEnum)).required(),
        customerInfo: joi.object({
            name: joi.string().min(2).max(100).required(),
            email: GeneralRules.email.required(),
            phone: GeneralRules.phone.required(),
            city: GeneralRules.city.required(),
            addressDetails: GeneralRules.addressDetails.allow(""),
            billingInfo: joi.string().max(300).allow("")
        }).required(),
        appliedCoupons: joi.array().items(GeneralRules.objectId),
        // TBD-04/05: no fixed fee formula yet, so the resolved fee — if
        // already computed client-side/by a Delivery employee — can be
        // passed in; it defaults to 0 for pickup or when not supplied.
        deliveryFee: joi.number().min(0)
    }).required()
}

export const cancelOrderSchema = {
    body: joi.object({
        reason: joi.string().min(2).max(300).required()
    }).required()
}

// FR-ORDER-09: authorized employees move status backward/forward.
export const changeStatusSchema = {
    body: joi.object({
        newStatus: joi.string().valid(...Object.values(orderStatusEnum)).required(),
        reason: joi.string().max(300).allow("")
    }).required()
}