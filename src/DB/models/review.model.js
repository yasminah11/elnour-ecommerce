import mongoose from "mongoose";
import { reviewStatusEnum } from "../../common/enum/review.enum.js";

// FR-REV-01/02/03: only a customer who purchased the item and whose order
// reached the eligible completed state may review it, validated server-side
// — orderItem is the proof-of-purchase link that makes that check possible.
const reviewSchema = new mongoose.Schema(
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
        },
        orderItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "orderItem",
            required: true
        },

        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true },

        // FR-REV-04: basic-rule moderation, manual staff override available.
        status: {
            type: String,
            enum: Object.values(reviewStatusEnum),
            default: reviewStatusEnum.published
        }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

reviewSchema.index({ user: 1, orderItem: 1 }, { unique: true })
reviewSchema.index({ variant: 1 })

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema)
export default reviewModel
