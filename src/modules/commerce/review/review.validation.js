import joi from "joi"
import { GeneralRules } from "../../../common/utils/generalRuels.js"

export const createReviewSchema = {
    body: joi.object({
        orderItem: GeneralRules.objectId.required(),
        rating: joi.number().integer().min(1).max(5).required(),
        comment: joi.string().max(2000)
    }).required()
}

export const moderateReviewSchema = {
    body: joi.object({
        status: joi.string().valid("published", "rejected").required()
    }).required()
}
