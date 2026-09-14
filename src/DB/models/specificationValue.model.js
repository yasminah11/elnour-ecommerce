import mongoose from "mongoose";

// FR-CAT-03: each ProductVariant carries its own values for the
// SpecificationDefinitions that apply to its category.
const specificationValueSchema = new mongoose.Schema(
    {
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "productVariant",
            required: true
        },
        specificationDefinition: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "specificationDefinition",
            required: true
        },

        // Mixed on purpose: fieldType on the definition (text/number/boolean/
        // select) decides how the value is interpreted/validated at the
        // service layer, so the column itself stays generic (FR-CAT-04).
        value: { type: mongoose.Schema.Types.Mixed, required: true }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

specificationValueSchema.index({ variant: 1, specificationDefinition: 1 }, { unique: true })

const specificationValueModel =
    mongoose.models.specificationValue || mongoose.model("specificationValue", specificationValueSchema)
export default specificationValueModel
