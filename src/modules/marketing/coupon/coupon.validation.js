import joi from "joi"
import { GeneralRules } from "../../../common/utils/generalRuels.js"
import { couponDiscountTypeEnum } from "../../../common/enum/promotion.enum.js"

export const createCouponSchema = {
    body: joi.object({
        code: joi.string().min(3).max(30).required(),
        discountType: joi.string().valid(...Object.values(couponDiscountTypeEnum)).required(),
        discountValue: joi.number().min(0).required(),
        usageLimit: joi.number().integer().min(1).allow(null),
        expiresAt: joi.date().allow(null),
        restrictedCategories: joi.array().items(GeneralRules.objectId),
        isActive: joi.boolean()
    }).required()
}

export const updateCouponSchema = {
    body: joi.object({
        discountType: joi.string().valid(...Object.values(couponDiscountTypeEnum)),
        discountValue: joi.number().min(0),
        usageLimit: joi.number().integer().min(1).allow(null),
        expiresAt: joi.date().allow(null),
        restrictedCategories: joi.array().items(GeneralRules.objectId),
        isActive: joi.boolean()
    }).min(1).required()
}
