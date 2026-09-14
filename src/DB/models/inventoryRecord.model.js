import mongoose from "mongoose";

// FR-INV-01: the ecommerce database is the controlled source for website
// stock quantities. FR-INV-08 / BR-02: single warehouse for this release —
// intentionally no warehouse/location field, so the design is not
// over-engineered around multi-warehouse (Task1 checklist point 11).
const inventoryRecordSchema = new mongoose.Schema(
    {
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "productVariant",
            required: true,
            unique: true
        },

        quantity: { type: Number, required: true, default: 0, min: 0 },

        // FR-INV-06: low-stock threshold, configurable per NFR-MAINT-01
        // rather than a hard-coded constant. Null = no threshold configured.
        lowStockThreshold: { type: Number, default: null, min: 0 }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

const inventoryRecordModel = mongoose.models.inventoryRecord || mongoose.model("inventoryRecord", inventoryRecordSchema)
export default inventoryRecordModel
