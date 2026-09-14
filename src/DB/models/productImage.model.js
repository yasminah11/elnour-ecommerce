import mongoose from "mongoose";

// FR-CAT-05 / FR-CAT-08: every variant has its own independent images.
const productImageSchema = new mongoose.Schema(
    {
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "productVariant",
            required: true
        },

        url: { type: String, required: true, trim: true },
        altText: { type: String, trim: true },
        isPrimary: { type: Boolean, default: false },
        sortOrder: { type: Number, default: 0 }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

productImageSchema.index({ variant: 1 })

const productImageModel = mongoose.models.productImage || mongoose.model("productImage", productImageSchema)
export default productImageModel
