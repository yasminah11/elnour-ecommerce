import joi from "joi"
import { GeneralRules } from "../../../common/utils/generalRuels.js"

export const createSpecValueSchema = {
    body: joi.object({
        variant: GeneralRules.objectId.required(),
        specificationDefinition: GeneralRules.objectId.required(),
        value: joi.alternatives().try(joi.string(), joi.number(), joi.boolean()).required()
    }).required()
}

export const updateSpecValueSchema = {
    body: joi.object({
        value: joi.alternatives().try(joi.string(), joi.number(), joi.boolean()).required()
    }).required()
}
