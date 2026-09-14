import joi from "joi"
import { GeneralRules } from "../../../common/utils/generalRuels.js"

export const addWishlistItemSchema = {
    body: joi.object({
        variant: GeneralRules.objectId.required()
    }).required()
}
