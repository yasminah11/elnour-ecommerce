import joi from "joi"
import { GeneralRules } from "../../../common/utils/generalRuels.js"

export const createProductImageSchema = {
    body: joi.object({
        variant: GeneralRules.objectId.required(),
        url: joi.string().uri().required(),
        altText: joi.string().max(150).allow(""),
        isPrimary: joi.boolean(),
        sortOrder: joi.number().integer().min(0)
    }).required()
}

export const updateProductImageSchema = {
    body: joi.object({
        url: joi.string().uri(),
        altText: joi.string().max(150).allow(""),
        isPrimary: joi.boolean(),
        sortOrder: joi.number().integer().min(0)
    }).min(1).required()
}