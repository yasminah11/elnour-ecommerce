import mongoose from "mongoose";
import { availabilityStatusEnum } from "../../common/enum/catalog.enum.js";

// FR-CAT-05: each product variant is independently identifiable and has its
// own SKU, price, stock (-> InventoryRecord, 1..1), images (-> ProductImage,
// 1..N) and specifications (-> SpecificationValue, 1..N).
const productVariantSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true
        },

        sku: { type: String, required: true, unique: true, trim: true },

        // FR-PAY-03: base prices are entered in EGP. USD display is a derived
        // presentation concern (FR-PAY-04/05), not stored per variant here.
        price: { type: Number, required: true, min: 0 },

        availabilityStatus: {
            type: String,
            enum: Object.values(availabilityStatusEnum),
            default: availabilityStatusEnum.inStock
        },

        // FR-CAT-07 / BR-06 / TBD-08: preorder is supported, but the exact
        // preorder/deposit/fulfillment policy is TBD-08 — only a flag +
        // free-form note are stored here, no invented deposit/priority rule.
        isPreorderEligible: { type: Boolean, default: false },
        preorderNote: { type: String, trim: true },

        isActive: { type: Boolean, default: true }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

productVariantSchema.index({ product: 1 })

const productVariantModel = mongoose.models.productVariant || mongoose.model("productVariant", productVariantSchema)
export default productVariantModel
