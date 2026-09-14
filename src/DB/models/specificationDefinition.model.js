import mongoose from "mongoose";
import { specFieldTypeEnum } from "../../common/enum/catalog.enum.js";

// FR-CAT-03: category-specific filters/specifications.
// FR-CAT-04: administrators define specification fields dynamically without
// a code deployment — that is exactly why this is data (a collection) and
// not a fixed set of columns on Product/ProductVariant.
const specificationDefinitionSchema = new mongoose.Schema(
    {
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category",
            required: true
        },

        fieldName: { type: String, required: true, trim: true },
        fieldNameAr: { type: String, trim: true },

        fieldType: {
            type: String,
            enum: Object.values(specFieldTypeEnum),
            default: specFieldTypeEnum.text
        },

        // Only meaningful when fieldType === "select".
        options: [{ type: String, trim: true }],

        // FR-SEARCH-02: category-specific filters displayed per category.
        isFilterable: { type: Boolean, default: true },
        isRequired: { type: Boolean, default: false }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

specificationDefinitionSchema.index({ category: 1 })

const specificationDefinitionModel =
    mongoose.models.specificationDefinition || mongoose.model("specificationDefinition", specificationDefinitionSchema)
export default specificationDefinitionModel
