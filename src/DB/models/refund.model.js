import mongoose from "mongoose";
import { refundMethodEnum, refundStatusEnum } from "../../common/enum/return.enum.js";

// FR-RET-06: refund recorded against the preferred/original method per
// business policy (TBD-07: the exact rules are not final).
// FR-RET-07: refund completion recorded separately from return approval —
// that's why this is its own collection rather than a field on ReturnRequest.
const refundSchema = new mongoose.Schema(
    {
        returnRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "returnRequest",
            required: true,
            unique: true
        },

        method: {
            type: String,
            enum: Object.values(refundMethodEnum),
            required: true
        },
        status: {
            type: String,
            enum: Object.values(refundStatusEnum),
            default: refundStatusEnum.pending
        },
        amount: { type: Number, required: true, min: 0 },

        // FR-ADMIN-06: Accountant handles refund records.
        processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "staff", default: null },
        processedAt: { type: Date, default: null }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

const refundModel = mongoose.models.refund || mongoose.model("refund", refundSchema)
export default refundModel
