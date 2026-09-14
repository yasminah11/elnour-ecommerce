import mongoose from "mongoose";
import {
    notificationChannelEnum,
    notificationStatusEnum,
    recipientModelEnum,
    notificationEventEnum
} from "../../common/enum/notification.enum.js";

// FR-NOTIF-01: notifications for order creation, status changes,
// cancellation, return decisions, and other configured events.
// FR-NOTIF-04: provider is abstracted so choice can change without rewriting
// business logic — provider name is a nullable config value (TBD-01/TBD-02).
// FR-NOTIF-05: delivery attempts/failures are logged (status + failureReason).
const notificationSchema = new mongoose.Schema(
    {
        recipient: { type: mongoose.Schema.Types.ObjectId, refPath: "recipientModel", required: true },
        recipientModel: {
            type: String,
            enum: Object.values(recipientModelEnum),
            required: true
        },

        channel: {
            type: String,
            enum: Object.values(notificationChannelEnum),
            required: true
        },
        eventType: {
            type: String,
            enum: Object.values(notificationEventEnum),
            required: true
        },

        // Template data / rendered message content for this notification.
        payload: { type: mongoose.Schema.Types.Mixed, default: {} },

        // TBD-01/TBD-02: SMS/WhatsApp provider not finalized.
        provider: { type: String, trim: true, default: null },

        status: {
            type: String,
            enum: Object.values(notificationStatusEnum),
            default: notificationStatusEnum.pending
        },
        failureReason: { type: String, trim: true, default: null },
        sentAt: { type: Date, default: null }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

notificationSchema.index({ recipient: 1, createdAt: -1 })

const notificationModel = mongoose.models.notification || mongoose.model("notification", notificationSchema)
export default notificationModel
