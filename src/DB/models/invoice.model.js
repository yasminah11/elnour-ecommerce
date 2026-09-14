import mongoose from "mongoose";
import { paymentMethodEnum, currencyEnum } from "../../common/enum/order.enum.js";

// FR-ORDER-10: an order is not fully completed without its required invoice
// record. FR-PAY-07: invoice contains items, quantities, prices, discounts,
// delivery fee, tax/charges if configured, currency, totals, payment method,
// and required customer information.
// FR-PAY-06 / TBD-03: the exchange rate used is preserved, never recomputed
// after the fact, so historical totals are not silently changed.
// NFR-DATA-03: once issued, an invoice is not overwritten — corrections are
// handled operationally outside this record (e.g. via Refund), not by
// editing invoice totals in place.
const invoiceSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "order",
            required: true,
            unique: true
        },

        invoiceNumber: { type: String, required: true, unique: true, trim: true },

        currency: {
            type: String,
            enum: Object.values(currencyEnum),
            default: currencyEnum.egp
        },
        // Null when currency === EGP. TBD-03: exact source of the rate.
        exchangeRateUsed: { type: Number, default: null },

        subtotal: { type: Number, required: true, min: 0 },
        discountTotal: { type: Number, default: 0, min: 0 },
        deliveryFee: { type: Number, default: 0, min: 0 },
        // TBD-10: legal tax/invoicing rules pending; default 0 until resolved.
        taxTotal: { type: Number, default: 0, min: 0 },
        grandTotal: { type: Number, required: true, min: 0 },

        paymentMethod: {
            type: String,
            enum: Object.values(paymentMethodEnum),
            required: true
        },

        // FR-PAY-07: customer information required by the business, captured
        // as a snapshot for the same historical-integrity reason as Order.
        customerInfoSnapshot: {
            name: { type: String, required: true, trim: true },
            billingInfo: { type: String, trim: true }
        },

        issuedAt: { type: Date, default: Date.now }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

const invoiceModel = mongoose.models.invoice || mongoose.model("invoice", invoiceSchema)
export default invoiceModel
