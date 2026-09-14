import mongoose from "mongoose";

// FR-PAY-05: USD values are derived from a current exchange rate sourced
// from an approved source — the exact source is TBD-03, this schema does
// NOT decide or assume one; `source` stays a free-form/nullable string until
// TBD-03 is resolved by the Product Owner / Accountant.
// Task2 note: the SRS describes this only as "preserve the rate used at
// transaction time" (already modeled as Order.exchangeRateUsed /
// Invoice.exchangeRateUsed snapshots) — no separate table with defined FK
// relationships is specified in the text. This collection exists purely so
// there is a configurable place to SET the current rate (NFR-MAINT-01); it
// intentionally has no relationship to Order/Invoice, they just copy the
// active rate's value into their own snapshot field at the time of use.
// NFR-DATA-03: append-only history — a new rate is a new row, not an edit.
const exchangeRateSchema = new mongoose.Schema(
    {
        rate: { type: Number, required: true, min: 0 },
        // TBD-03: source of the rate (e.g. "Central Bank of Egypt", a paid
        // FX API, manual entry) — left free-form/nullable on purpose.
        source: { type: String, trim: true, default: null },

        effectiveAt: { type: Date, required: true, default: Date.now },
        setBy: { type: mongoose.Schema.Types.ObjectId, ref: "staff", required: true },

        isActive: { type: Boolean, default: true }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

exchangeRateSchema.index({ effectiveAt: -1 })

const exchangeRateModel = mongoose.models.exchangeRate || mongoose.model("exchangeRate", exchangeRateSchema)
export default exchangeRateModel
