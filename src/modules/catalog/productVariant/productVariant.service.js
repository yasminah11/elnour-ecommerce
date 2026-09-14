import productVariantModel from "../../../DB/models/productVariant.model.js"
import inventoryRecordModel from "../../../DB/models/inventoryRecord.model.js"
import productImageModel from "../../../DB/models/productImage.model.js"
import specificationValueModel from "../../../DB/models/specificationValue.model.js"
import * as db_service from "../../../DB/db.service.js"
import successResponse from "../../../common/utils/successes_response/succsses.response.js"
import { availabilityStatusEnum } from "../../../common/enum/catalog.enum.js"

// FR-CAT-05: every variant is independently identifiable with its own
// SKU/price/stock. FR-INV-01: stock lives in InventoryRecord (1..1), so
// creating a variant also provisions its InventoryRecord instead of leaving
// it to be created by a second manual call.
//
// Data-consistency guard: availabilityStatus is a separate, manually-set
// field from the real stock number, so a variant could otherwise be created
// as "inStock" while its InventoryRecord starts at 0 — the storefront would
// then show it as purchasable while every add-to-cart is correctly rejected
// with 409 by cart.service.addItem. We keep preorder untouched (FR-CAT-07)
// and only correct the inStock/outOfStock mismatch at creation time.
export const createVariant = async (req, res, next) => {
    const { product, sku, price, availabilityStatus, isPreorderEligible, preorderNote, initialQuantity = 0 } = req.body

    if (await db_service.findOne({ model: productVariantModel, check: { sku } })) {
        throw new Error("sku already exist", { cause: 409 })
    }

    const resolvedAvailabilityStatus =
        availabilityStatus === availabilityStatusEnum.inStock && initialQuantity <= 0
            ? availabilityStatusEnum.outOfStock
            : availabilityStatus

    const variant = await db_service.create({
        model: productVariantModel,
        dataa: { product, sku, price, availabilityStatus: resolvedAvailabilityStatus, isPreorderEligible, preorderNote }
    })

    await db_service.create({
        model: inventoryRecordModel,
        dataa: { variant: variant._id, quantity: initialQuantity }
    })

    successResponse({ res, status: 201, message: "variant created", data: variant })
}

// A variant cannot exist without its InventoryRecord/ProductImage/
// SpecificationValue children (FR-CAT-05 composition), so deleting it
// cascades — this keeps the database from accumulating orphaned rows,
// it does not touch any historical order/invoice data (those keep their
// own skuSnapshot/nameSnapshot per NFR-DATA-03, they don't need the live
// variant to still exist).
export const deleteVariant = async (req, res, next) => {
    const { id } = req.params
    const variant = await db_service.deleteById({ model: productVariantModel, id })
    if (!variant) {
        throw new Error("variant NOT FOUND", { cause: 404 })
    }
    await db_service.deleteMany({ model: inventoryRecordModel, check: { variant: id } })
    await db_service.deleteMany({ model: productImageModel, check: { variant: id } })
    await db_service.deleteMany({ model: specificationValueModel, check: { variant: id } })
    successResponse({ res, message: "variant deleted" })
}