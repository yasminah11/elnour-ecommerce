import mongoose from "mongoose";
import { orderStatusEnum } from "../../common/enum/order.enum.js";

// FR-FLOW-03: status history shows actor, time, old status, new status, and
// reason where required. BR-14: employees can move status backward or
// forward when authorized; every such action is logged.
// NFR-DATA-03: append-only, never edited/deleted.
const orderStatusHistorySchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "order",
            required: true
        },

        // Either the customer (self-cancellation, FR-ORDER-07) or a staff
        // member (FR-ORDER-08/09).
        actor: { type: mongoose.Schema.Types.ObjectId, refPath: "actorModel", required: true },
        actorModel: { type: String, enum: ["auth", "staff"], required: true },

        oldStatus: { type: String, enum: Object.values(orderStatusEnum) },
        newStatus: { type: String, enum: Object.values(orderStatusEnum), required: true },
        reason: { type: String, trim: true }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

orderStatusHistorySchema.index({ order: 1, createdAt: 1 })

const orderStatusHistoryModel =
    mongoose.models.orderStatusHistory || mongoose.model("orderStatusHistory", orderStatusHistorySchema)
export default orderStatusHistoryModel
