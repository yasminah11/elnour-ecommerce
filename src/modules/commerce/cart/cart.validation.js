import joi from "joi"
import { GeneralRules } from "../../../common/utils/generalRuels.js"

export const addItemSchema = {
    body: joi.object({
        variant: GeneralRules.objectId.required(),
        quantity: joi.number().integer().min(1).required()
    }).required()
}

export const updateItemSchema = {
    body: joi.object({
        quantity: joi.number().integer().min(1).required()
    }).required(),
    params: joi.object({
        itemId: GeneralRules.objectId.required()
    }).required()
}

export const itemParamSchema = {
    params: joi.object({
        itemId: GeneralRules.objectId.required()
    }).required()
}
