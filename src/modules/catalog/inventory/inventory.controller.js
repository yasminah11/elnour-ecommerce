import { Router } from "express"
import inventoryRecordModel from "../../../DB/models/inventoryRecord.model.js"
import inventoryAdjustmentModel from "../../../DB/models/inventoryAdjustment.model.js"
import * as IV from "./inventory.validation.js"
import * as IS from "./inventory.service.js"
import { listHandler, getOneHandler, updateHandler } from "../../../common/factories/crud.factory.js"
import validation from "../../../common/middleware/validation.js"
import { idParamSchema, listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"

const inventoryRouter = Router({ caseSensitive: true, strict: true })

const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
// FR-ADMIN-04: Inventory role owns stock functions; Owner/Admin retain access.
const manageStock = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin, staffRoleEnum.inventory] })

// FR-INV-01: stock records — staff-only, this is not customer-facing data
// (the storefront only ever sees the derived availabilityStatus on Variant).
inventoryRouter.get(
    "/records",
    authenticateStaff,
    manageStock,
    validation(listQuerySchema),
    listHandler({ model: inventoryRecordModel, populate: ["variant"] })
)
inventoryRouter.get(
    "/records/:id",
    authenticateStaff,
    manageStock,
    validation(idParamSchema),
    getOneHandler({ model: inventoryRecordModel, populate: ["variant"], notFoundMessage: "inventory record NOT FOUND" })
)

// FR-INV-06: low-stock threshold is configurable per NFR-MAINT-01.
inventoryRouter.patch(
    "/records/:id/threshold",
    authenticateStaff,
    manageStock,
    validation({ ...idParamSchema, ...IV.updateThresholdSchema }),
    updateHandler({ model: inventoryRecordModel, notFoundMessage: "inventory record NOT FOUND", message: "threshold updated" })
)

// FR-INV-03/04: manual adjustment (physical sale, correction, restock).
inventoryRouter.post(
    "/adjustments",
    authenticateStaff,
    manageStock,
    validation(IV.createAdjustmentSchema),
    IS.recordAdjustment
)
inventoryRouter.get(
    "/adjustments",
    authenticateStaff,
    manageStock,
    validation(listQuerySchema),
    listHandler({
        model: inventoryAdjustmentModel,
        populate: ["inventoryRecord", "actor"],
        buildFilter: (req) => (req.query.inventoryRecord ? { inventoryRecord: req.query.inventoryRecord } : {})
    })
)

export default inventoryRouter
