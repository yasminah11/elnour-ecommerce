import joi from "joi"
import { GeneralRules } from "../../../common/utils/generalRuels.js"
import { notificationChannelEnum, notificationEventEnum, recipientModelEnum } from "../../../common/enum/notification.enum.js"

export const createNotificationSchema = {
    body: joi.object({
        recipient: GeneralRules.objectId.required(),
        recipientModel: joi.string().valid(...Object.values(recipientModelEnum)).required(),
        channel: joi.string().valid(...Object.values(notificationChannelEnum)).required(),
        eventType: joi.string().valid(...Object.values(notificationEventEnum)).required(),
        payload: joi.object()
    }).required()
}
