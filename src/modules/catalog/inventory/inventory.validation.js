import joi from "joi"
import { GeneralRules } from "../../../common/utils/generalRuels.js"

export const updateThresholdSchema = {
    body: joi.object({
        lowStockThreshold: joi.number().integer().min(0).allow(null).required()
    }).required()
}

// FR-INV-03/04: manual stock adjustment with a reason, audit history kept.
export const createAdjustmentSchema = {
    body: joi.object({
        variant: GeneralRules.objectId.required(),
        quantityChange: joi.number().integer().invalid(0).required(),
        reason: joi.string().min(2).max(300).required(),
        reference: joi.string().max(150)
    }).required()
}
