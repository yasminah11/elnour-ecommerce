import joi from "joi"
import { GeneralRules } from "../../../common/utils/generalRuels.js"
import { specFieldTypeEnum } from "../../../common/enum/catalog.enum.js"

export const createSpecDefinitionSchema = {
    body: joi.object({
        category: GeneralRules.objectId.required(),
        fieldName: joi.string().min(1).max(80).required(),
        fieldNameAr: joi.string().min(1).max(80).allow(""),
        fieldType: joi.string().valid(...Object.values(specFieldTypeEnum)),
        options: joi.array().items(joi.string().max(80)),
        isFilterable: joi.boolean(),
        isRequired: joi.boolean()
    }).required()
}

export const updateSpecDefinitionSchema = {
    body: joi.object({
        fieldName: joi.string().min(1).max(80),
        fieldNameAr: joi.string().min(1).max(80).allow(""),
        fieldType: joi.string().valid(...Object.values(specFieldTypeEnum)),
        options: joi.array().items(joi.string().max(80)),
        isFilterable: joi.boolean(),
        isRequired: joi.boolean()
    }).min(1).required()
}