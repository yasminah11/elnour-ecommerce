import mongoose from "mongoose";

// FR-RET-01: which order items are being returned, and in what quantity.
// FR-INV-07: restockable=true is what should trigger the InventoryAdjustment
// that increments stock once inspection is complete.
const returnItemSchema = new mongoose.Schema(
    {
        returnRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "returnRequest",
            required: true
        },
        orderItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "orderItem",
            required: true
        },

        quantity: { type: Number, required: true, min: 1 },

        // Decided during inspection (FR-RET-05), null until then.
        restockable: { type: Boolean, default: null }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

returnItemSchema.index({ returnRequest: 1 })

const returnItemModel = mongoose.models.returnItem || mongoose.model("returnItem", returnItemSchema)
export default returnItemModel
