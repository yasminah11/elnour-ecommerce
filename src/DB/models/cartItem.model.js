import mongoose from "mongoose";

// FR-CART-02: add/remove products, change quantities.
// FR-CART-03: availability/quantity validation happens against
// InventoryRecord at service/order-confirmation time, not stored here.
const cartItemSchema = new mongoose.Schema(
    {
        cart: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "cart",
            required: true
        },
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "productVariant",
            required: true
        },
        quantity: { type: Number, required: true, min: 1, default: 1 }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

cartItemSchema.index({ cart: 1, variant: 1 }, { unique: true })

const cartItemModel = mongoose.models.cartItem || mongoose.model("cartItem", cartItemSchema)
export default cartItemModel
