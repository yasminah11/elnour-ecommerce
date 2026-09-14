import mongoose from "mongoose";

// FR-CART-01: guests can add products to the cart without registering, so a
// cart cannot always be keyed by a registered user — sessionId is a purely
// technical identifier (not a money/stock/permission rule) that lets a guest
// cart exist, and it is expected to be reconciled into the user's cart once
// they authenticate (FR-AUTH-02 requires an account before checkout).
const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auth",
            default: null
        },
        sessionId: { type: String, default: null, trim: true }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

cartSchema.index({ user: 1 }, { unique: true, sparse: true })
cartSchema.index({ sessionId: 1 }, { unique: true, sparse: true })

const cartModel = mongoose.models.cart || mongoose.model("cart", cartSchema)
export default cartModel
