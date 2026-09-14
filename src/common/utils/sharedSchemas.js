import joi from "joi"
import { GeneralRules } from "./generalRuels.js"

export const idParamSchema = {
    params: joi.object({
        id: GeneralRules.objectId.required()
    }).required()
}

export const listQuerySchema = {
    // page/limit are validated strictly, but each module is free to read its
    // own extra filter keys from req.query in its buildFilter() (category/q
    // on products, status on orders/reviews, etc.) — those are validated by
    // the module's own schema where needed, not here, so we must not reject
    // them as "unknown".
    query: joi.object({
        page: GeneralRules.page,
        limit: GeneralRules.limit
    }).unknown(true)
}