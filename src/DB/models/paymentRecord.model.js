import mongoose from "mongoose";
import { paymentMethodEnum } from "../../common/enum/order.enum.js";
import { paymentStatusEnum } from "../../common/enum/payment.enum.js";

// FR-PAY-02: payment status is stored separately from order status.
// FR-ADMIN-06: Accountant role manages payment records.
const paymentRecordSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "order",
            required: true
        },

        method: {
            type: String,
            enum: Object.values(paymentMethodEnum),
            required: true
        },
        status: {
            type: String,
            enum: Object.values(paymentStatusEnum),
            default: paymentStatusEnum.pending
        },
        amount: { type: Number, required: true, min: 0 },

        recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "staff" },
        paidAt: { type: Date, default: null }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

paymentRecordSchema.index({ order: 1 })

const paymentRecordModel = mongoose.models.paymentRecord || mongoose.model("paymentRecord", paymentRecordSchema)
export default paymentRecordModel
