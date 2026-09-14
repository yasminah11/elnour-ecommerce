import mongoose from "mongoose";

// FR-INV-03/04: employees record physical-store sales/stock adjustments
// manually, with a reason and audit history. Section 9.3: actor, timestamp,
// quantity change and reason/reference are all captured.
// NFR-DATA-03: this collection is append-only — a correction is a NEW
// adjustment row, existing rows must never be edited or deleted, so the
// history stays intact.
const inventoryAdjustmentSchema = new mongoose.Schema(
    {
        inventoryRecord: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "inventoryRecord",
            required: true
        },

        // BR-03: physical-store stock changes are entered by a cashier/
        // authorized employee.
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "staff",
            required: true
        },

        // Positive for an increase (e.g. FR-INV-07 accepted return), negative
        // for a decrease (e.g. physical sale, online order reservation).
        quantityChange: { type: Number, required: true },

        // Snapshot of the resulting quantity at the time of this adjustment,
        // so history reads correctly even if later adjustments are added.
        quantityAfter: { type: Number, required: true, min: 0 },

        reason: { type: String, required: true, trim: true },
        // Optional pointer to what caused it (order id, return id, free text
        // reference for a manual physical-store sale).
        reference: { type: String, trim: true }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

inventoryAdjustmentSchema.index({ inventoryRecord: 1, createdAt: -1 })

const inventoryAdjustmentModel =
    mongoose.models.inventoryAdjustment || mongoose.model("inventoryAdjustment", inventoryAdjustmentSchema)
export default inventoryAdjustmentModel
