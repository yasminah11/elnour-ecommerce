import mongoose from "mongoose";

// FR-CART-04: authenticated customers maintain wishlist/favorites/saved
// products — unlike Cart, this requires a registered user (no guest state).
const wishlistItemSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auth",
            required: true
        },
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "productVariant",
            required: true
        }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

wishlistItemSchema.index({ user: 1, variant: 1 }, { unique: true })

const wishlistItemModel = mongoose.models.wishlistItem || mongoose.model("wishlistItem", wishlistItemSchema)
export default wishlistItemModel
