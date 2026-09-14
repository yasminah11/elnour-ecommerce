import joi from "joi"
import { GeneralRules } from "../../../common/utils/generalRuels.js"
import { deliveryTrackingStatusEnum } from "../../../common/enum/delivery.enum.js"

export const createDeliverySchema = {
    body: joi.object({
        order: GeneralRules.objectId.required(),
        addressSnapshot: joi.object({
            city: joi.string().required(),
            details: joi.string().required()
        }).required(),
        sourceAddressId: GeneralRules.objectId,
        // TBD-05 / TBD-04: distance/fee are resolved values, not formulas.
        distanceKm: joi.number().min(0),
        deliveryFee: joi.number().min(0),
        assignedEmployee: GeneralRules.objectId
    }).required()
}

export const updateTrackingSchema = {
    body: joi.object({
        trackingStatus: joi.string().valid(...Object.values(deliveryTrackingStatusEnum)).required(),
        exceptionNote: joi.string().max(300)
    }).required()
}
