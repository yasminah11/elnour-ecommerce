import mongoose from "mongoose";

// FR-CAT-02: categories and subcategories.
// TBD-09: the exact final catalog taxonomy is not decided yet — the
// self-referencing parentCategory link keeps the tree depth/shape flexible
// instead of hard-coding a fixed number of levels.
const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        // NFR-UX-01 / NFR-I18N-01: Arabic/English storefront, externalized text.
        nameAr: { type: String, trim: true },

        parentCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category",
            default: null
        },

        // FR-CAT-06 style visibility control for categories themselves.
        isActive: { type: Boolean, default: true }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

categorySchema.index({ parentCategory: 1 })

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema)
export default categoryModel
