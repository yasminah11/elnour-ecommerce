import joi from "joi"
import { GeneralRules } from "../../../common/utils/generalRuels.js"

export const createCategorySchema = {
    body: joi.object({
        name: joi.string().min(2).max(100).required(),
        nameAr: joi.string().min(2).max(100).allow(""),
        parentCategory: GeneralRules.objectId.allow(null, ""),
        isActive: joi.boolean()
    }).required()
}

export const updateCategorySchema = {
    body: joi.object({
        name: joi.string().min(2).max(100),
        nameAr: joi.string().min(2).max(100).allow(""),
        parentCategory: GeneralRules.objectId.allow(null, ""),
        isActive: joi.boolean()
    }).min(1).required()
}