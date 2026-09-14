import mongoose from "mongoose";

// FR-PAY-07: invoice items with quantity, price, discount.
const invoiceItemSchema = new mongoose.Schema(
    {
        invoice: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "invoice",
            required: true
        },
        orderItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "orderItem",
            default: null
        },

        description: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        discount: { type: Number, default: 0, min: 0 },
        lineTotal: { type: Number, required: true, min: 0 }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

invoiceItemSchema.index({ invoice: 1 })

const invoiceItemModel = mongoose.models.invoiceItem || mongoose.model("invoiceItem", invoiceItemSchema)
export default invoiceItemModel
