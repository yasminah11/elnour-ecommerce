import mongoose from "mongoose";

// FR-CAT-08: images, description, brand, pricing, specs, warranty, other
// configured attributes. Pricing/images/specs live on ProductVariant per
// FR-CAT-05 (each variant is fully independent), Product only holds the
// attributes shared by every variant of the same product.
// Section 14: "Product" — logical entity, not a final schema (Section 18).
const productSchema = new mongoose.Schema(
    {
        // Not explicitly listed in the Task2 field table, but every FR-CAT-08
        // example (catalog browsing/search) needs a display name — this is a
        // structural field, not a money/stock/permission business rule.
        name: { type: String, required: true, trim: true },
        nameAr: { type: String, trim: true },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category",
            required: true
        },

        brand: { type: String, trim: true },
        description: { type: String, trim: true },
        descriptionAr: { type: String, trim: true },

        // FR-CAT-08: warranty information.
        warranty: { type: String, trim: true },

        // FR-CAT-06 / FR-INV-05: a product/variant stays visible even when
        // out of stock; isActive is only for the admin hiding a discontinued
        // product entirely, a separate concern from stock state.
        isActive: { type: Boolean, default: true }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

productSchema.index({ category: 1 })

const productModel = mongoose.models.product || mongoose.model("product", productSchema)
export default productModel
