import joi from "joi"
import { paymentStatusEnum } from "../../../common/enum/payment.enum.js"

export const updatePaymentStatusSchema = {
    body: joi.object({
        status: joi.string().valid(...Object.values(paymentStatusEnum)).required()
    }).required()
}
