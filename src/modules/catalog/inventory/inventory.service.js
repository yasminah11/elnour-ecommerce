import inventoryRecordModel from "../../../DB/models/inventoryRecord.model.js"
import inventoryAdjustmentModel from "../../../DB/models/inventoryAdjustment.model.js"
import productVariantModel from "../../../DB/models/productVariant.model.js"
import * as db_service from "../../../DB/db.service.js"
import successResponse from "../../../common/utils/successes_response/succsses.response.js"
import { writeAudit } from "../../../common/utils/audit.util.js"
import { actorModelEnum } from "../../../common/enum/audit.enum.js"
import { availabilityStatusEnum } from "../../../common/enum/catalog.enum.js"

// FR-INV-03/04: an employee records a physical-store sale or stock
// adjustment manually, with a reason; the system keeps a full audit trail.
// NFR-DATA-03: InventoryAdjustment rows are append-only, so the quantity on
// InventoryRecord is only ever moved by $inc, never set directly by a client.
export const recordAdjustment = async (req, res, next) => {
    const { variant, quantityChange, reason, reference } = req.body

    const record = await db_service.findOne({ model: inventoryRecordModel, check: { variant } })
    if (!record) {
        throw new Error("inventory record NOT FOUND for this variant", { cause: 404 })
    }

    const quantityAfter = record.quantity + quantityChange
    if (quantityAfter < 0) {
        throw new Error("adjustment would drop stock below zero", { cause: 409 })
    }

    record.quantity = quantityAfter
    await record.save()

    // Keep productVariant.availabilityStatus in sync with the real stock
    // number so the storefront never shows "inStock" for a variant that has
    // 0 units left (or vice versa). preorder is left untouched — it is a
    // deliberate merchandising choice (FR-CAT-07), not a stock signal.
    const variantDoc = await db_service.findOne({ model: productVariantModel, check: { _id: record.variant } })
    if (variantDoc && variantDoc.availabilityStatus !== availabilityStatusEnum.preorder) {
        const shouldBeOutOfStock = quantityAfter <= 0
        const nextStatus = shouldBeOutOfStock ? availabilityStatusEnum.outOfStock : availabilityStatusEnum.inStock
        if (variantDoc.availabilityStatus !== nextStatus) {
            variantDoc.availabilityStatus = nextStatus
            await variantDoc.save()
        }
    }

    const adjustment = await db_service.create({
        model: inventoryAdjustmentModel,
        dataa: {
            inventoryRecord: record._id,
            actor: req.auth._id,
            quantityChange,
            quantityAfter,
            reason,
            reference
        }
    })

    // FR-ADMIN-08 / NFR-SEC-05
    await writeAudit({
        actor: req.auth._id,
        actorModel: actorModelEnum.staff,
        action: "inventory.adjustment",
        targetType: "inventoryRecord",
        targetId: record._id,
        metadata: { quantityChange, quantityAfter, reason }
    })

    successResponse({ res, status: 201, message: "adjustment recorded", data: adjustment })
}