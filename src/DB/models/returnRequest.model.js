import mongoose from "mongoose";
import { returnStatusEnum, physicalReceiptStateEnum } from "../../common/enum/return.enum.js";

// FR-RET-01/02/03: return requests for eligible orders/items; eligibility
// period is configurable per product/item policy (TBD-06 — not decided, so
// no fixed number of days is hard-coded here or elsewhere in the schema).
// FR-RET-04: approval manual, restricted to Admin/Sales (enforced by the
// authorization middleware using reviewedBy's role, not by this schema).
const returnRequestSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "order",
            required: true
        },

        reason: { type: String, required: true, trim: true },
        // FR-RET-03: optional description/evidence.
        reasonDetails: { type: String, trim: true },
        evidenceUrls: [{ type: String, trim: true }],

        status: {
            type: String,
            enum: Object.values(returnStatusEnum),
            default: returnStatusEnum.requested
        },

        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "staff", default: null },
        reviewedAt: { type: Date, default: null },

        // FR-RET-05: approved returns track physical receipt/inspection state.
        physicalReceiptState: {
            type: String,
            enum: Object.values(physicalReceiptStateEnum),
            default: physicalReceiptStateEnum.pending
        }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

returnRequestSchema.index({ order: 1 })

const returnRequestModel = mongoose.models.returnRequest || mongoose.model("returnRequest", returnRequestSchema)
export default returnRequestModel
