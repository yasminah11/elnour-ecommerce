import mongoose from "mongoose";
import { orderStatusEnum, fulfillmentMethodEnum, paymentMethodEnum, currencyEnum } from "../../common/enum/order.enum.js";

// FR-ORDER-01: checkout collects name, email, phone, city, address, billing
// info, fulfillment method, payment method.
// NFR-DATA-03: this data is captured as a SNAPSHOT on the order — a saved
// address/billing info edited later must not silently change a past order.
const customerSnapshotSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        addressDetails: { type: String, trim: true },
        billingInfo: { type: String, trim: true }
    },
    { _id: false }
)

// FR-ORDER-01/05/06/07/08/09/10, FR-FLOW-01/02
const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auth",
            required: true
        },

        // FR-ORDER-05: unique order identifier for every order.
        orderNumber: { type: String, required: true, unique: true, trim: true },

        fulfillmentMethod: {
            type: String,
            enum: Object.values(fulfillmentMethodEnum),
            required: true
        },
        paymentMethod: {
            type: String,
            enum: Object.values(paymentMethodEnum),
            required: true
        },

        // FR-FLOW-01/02/03
        status: {
            type: String,
            enum: Object.values(orderStatusEnum),
            default: orderStatusEnum.pendingPayment
        },

        customerInfo: { type: customerSnapshotSchema, required: true },

        currency: {
            type: String,
            enum: Object.values(currencyEnum),
            default: currencyEnum.egp
        },
        // FR-PAY-06 / TBD-03: only meaningful when currency === USD; preserves
        // the rate used at order time, exact source TBD-03.
        exchangeRateUsed: { type: Number, default: null },

        subtotal: { type: Number, required: true, min: 0 },
        discountTotal: { type: Number, default: 0, min: 0 },
        // FR-DEL-03/04, TBD-04/05: fee is stored as the resolved amount; the
        // formula/distance-source that produced it is a configurable service
        // concern, not hard-coded on the schema.
        deliveryFee: { type: Number, default: 0, min: 0 },
        // TBD-10: legal tax/invoicing rules are not final — default 0 until
        // resolved, never assumed.
        taxTotal: { type: Number, default: 0, min: 0 },
        grandTotal: { type: Number, required: true, min: 0 },

        appliedCoupons: [{ type: mongoose.Schema.Types.ObjectId, ref: "coupon" }],
        appliedPromotions: [{ type: mongoose.Schema.Types.ObjectId, ref: "promotion" }],

        // FR-ORDER-07/08: cancellation reason, and who cancelled it.
        cancellationReason: { type: String, trim: true },
        cancelledBy: { type: mongoose.Schema.Types.ObjectId, refPath: "cancelledByModel" },
        cancelledByModel: { type: String, enum: ["auth", "staff"] }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

orderSchema.index({ user: 1, createdAt: -1 })

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema)
export default orderModel
