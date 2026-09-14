import mongoose from "mongoose";
import { couponDiscountTypeEnum } from "../../common/enum/promotion.enum.js";

// FR-PROMO-04: coupon codes with usage limits and expiration dates.
// FR-PROMO-05: general or restricted to specific categories.
// FR-PROMO-06: invalid/expired/over-limit coupons must be rejected — this
// schema stores the data that check needs (usageLimit/usedCount/expiresAt);
// the rejection logic itself lives in the service layer, not the schema.
const couponSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, trim: true, uppercase: true },

        discountType: {
            type: String,
            enum: Object.values(couponDiscountTypeEnum),
            required: true
        },
        discountValue: { type: Number, required: true, min: 0 },

        usageLimit: { type: Number, default: null, min: 1 },
        usedCount: { type: Number, default: 0, min: 0 },
        expiresAt: { type: Date, default: null },

        // FR-PROMO-05: empty = general coupon, otherwise restricted.
        restrictedCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "category" }],

        isActive: { type: Boolean, default: true }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

const couponModel = mongoose.models.coupon || mongoose.model("coupon", couponSchema)
export default couponModel
