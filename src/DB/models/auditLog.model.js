import mongoose from "mongoose";
import { auditOutcomeEnum, actorModelEnum } from "../../common/enum/audit.enum.js";

// NFR-SEC-05: administrative/high-impact actions logged with actor,
// timestamp, target, action, and outcome.
// FR-ADMIN-08: every privileged mutation of stock, order state, payment,
// refund, role, or configuration is auditable.
// Task2 note: the SRS only describes this entity's fields, without an
// explicit FK relationship in the text, so no relation was assumed here
// beyond a generic polymorphic actor/target pointer.
// NFR-DATA-03: append-only, never edited/deleted.
const auditLogSchema = new mongoose.Schema(
    {
        actor: { type: mongoose.Schema.Types.ObjectId, refPath: "actorModel", required: true },
        actorModel: {
            type: String,
            enum: Object.values(actorModelEnum),
            required: true
        },

        action: { type: String, required: true, trim: true },

        // e.g. "order", "inventoryRecord", "staff", "coupon" — free-form
        // string naming the affected collection, plus its id.
        targetType: { type: String, required: true, trim: true },
        targetId: { type: mongoose.Schema.Types.ObjectId, default: null },

        outcome: {
            type: String,
            enum: Object.values(auditOutcomeEnum),
            required: true
        },

        metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

auditLogSchema.index({ targetType: 1, targetId: 1 })
auditLogSchema.index({ actor: 1, createdAt: -1 })

const auditLogModel = mongoose.models.auditLog || mongoose.model("auditLog", auditLogSchema)
export default auditLogModel
