import joi from "joi"
import { GeneralRules } from "../../../common/utils/generalRuels.js"
import { promoTypeEnum } from "../../../common/enum/promotion.enum.js"

export const createPromotionSchema = {
    body: joi.object({
        name: joi.string().min(2).max(150).required(),
        nameAr: joi.string().min(2).max(150).allow(""),
        promoType: joi.string().valid(...Object.values(promoTypeEnum)).required(),
        // NFR-MAINT-01: rule-specific parameters, shape depends on promoType.
        config: joi.object().required(),
        variants: joi.array().items(GeneralRules.objectId),
        startsAt: joi.date().allow(null),
        endsAt: joi.date().allow(null),
        isActive: joi.boolean()
    }).required()
}

export const updatePromotionSchema = {
    body: joi.object({
        name: joi.string().min(2).max(150),
        nameAr: joi.string().min(2).max(150).allow(""),
        config: joi.object(),
        variants: joi.array().items(GeneralRules.objectId),
        startsAt: joi.date().allow(null),
        endsAt: joi.date().allow(null),
        isActive: joi.boolean()
    }).min(1).required()
}