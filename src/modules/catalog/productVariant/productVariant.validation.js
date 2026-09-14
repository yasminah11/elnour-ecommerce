import joi from "joi"
import { GeneralRules } from "../../../common/utils/generalRuels.js"
import { availabilityStatusEnum } from "../../../common/enum/catalog.enum.js"

export const createVariantSchema = {
    body: joi.object({
        product: GeneralRules.objectId.required(),
        sku: joi.string().min(2).max(60).required(),
        price: joi.number().min(0).required(),
        availabilityStatus: joi.string().valid(...Object.values(availabilityStatusEnum)),
        isPreorderEligible: joi.boolean(),
        preorderNote: joi.string().max(300).allow(""),
        // FR-INV-01: initial stock quantity for the InventoryRecord created
        // alongside this variant (1..1 relationship, FR-CAT-05).
        initialQuantity: joi.number().integer().min(0)
    }).required()
}

export const updateVariantSchema = {
    body: joi.object({
        sku: joi.string().min(2).max(60),
        price: joi.number().min(0),
        availabilityStatus: joi.string().valid(...Object.values(availabilityStatusEnum)),
        isPreorderEligible: joi.boolean(),
        preorderNote: joi.string().max(300).allow(""),
        isActive: joi.boolean()
    }).min(1).required()
}