import joi from "joi"

export const createExchangeRateSchema = {
    body: joi.object({
        rate: joi.number().min(0).required(),
        source: joi.string().max(150)
    }).required()
}
