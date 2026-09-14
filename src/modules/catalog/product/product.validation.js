import joi from "joi"
import { GeneralRules } from "../../../common/utils/generalRuels.js"

export const createProductSchema = {
    body: joi.object({
        name: joi.string().min(2).max(150).required(),
        nameAr: joi.string().min(2).max(150).allow(""),
        category: GeneralRules.objectId.required(),
        brand: joi.string().max(80).allow(""),
        description: joi.string().max(5000).allow(""),
        descriptionAr: joi.string().max(5000).allow(""),
        warranty: joi.string().max(200).allow(""),
        isActive: joi.boolean()
    }).required()
}

export const updateProductSchema = {
    body: joi.object({
        name: joi.string().min(2).max(150),
        nameAr: joi.string().min(2).max(150).allow(""),
        category: GeneralRules.objectId,
        brand: joi.string().max(80).allow(""),
        description: joi.string().max(5000).allow(""),
        descriptionAr: joi.string().max(5000).allow(""),
        warranty: joi.string().max(200).allow(""),
        isActive: joi.boolean()
    }).min(1).required()
}