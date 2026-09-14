import mongoose from "mongoose";
import { promoTypeEnum } from "../../common/enum/promotion.enum.js";

// FR-PROMO-01/02/03: percentage, fixed-amount, Buy X Get Y, X+Y% promotions.
// NFR-MAINT-01: business rules such as discounts must be configurable rather
// than hard-coded — `config` holds the type-specific parameters (e.g.
// { percentage } | { fixedAmount } | { buyQty, getQty } | { xQty, yPercent })
// so a new percentage/quantity does not require a code change.
const promotionSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        nameAr: { type: String, trim: true },

        promoType: {
            type: String,
            enum: Object.values(promoTypeEnum),
            required: true
        },
        config: { type: mongoose.Schema.Types.Mixed, required: true, default: {} },

        variants: [{ type: mongoose.Schema.Types.ObjectId, ref: "productVariant" }],

        startsAt: { type: Date, default: null },
        endsAt: { type: Date, default: null },
        isActive: { type: Boolean, default: true }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

const promotionModel = mongoose.models.promotion || mongoose.model("promotion", promotionSchema)
export default promotionModel
