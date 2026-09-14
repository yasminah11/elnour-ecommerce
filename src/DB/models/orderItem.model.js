import mongoose from "mongoose";

// FR-ORDER-01. NFR-DATA-03: unitPrice/sku are snapshotted at purchase time —
// a later price change on ProductVariant must not rewrite past order totals.
const orderItemSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "order",
            required: true
        },
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "productVariant",
            required: true
        },

        skuSnapshot: { type: String, required: true, trim: true },
        nameSnapshot: { type: String, trim: true },

        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        lineTotal: { type: Number, required: true, min: 0 }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

orderItemSchema.index({ order: 1 })

const orderItemModel = mongoose.models.orderItem || mongoose.model("orderItem", orderItemSchema)
export default orderItemModel
