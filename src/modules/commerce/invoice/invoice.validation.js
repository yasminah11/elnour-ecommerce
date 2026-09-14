import joi from "joi"
import { currencyEnum } from "../../../common/enum/order.enum.js"

export const generateInvoiceSchema = {
    body: joi.object({
        currency: joi.string().valid(...Object.values(currencyEnum))
    })
}
