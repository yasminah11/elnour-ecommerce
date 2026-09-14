import { Router } from "express"
import returnRequestModel from "../../../DB/models/returnRequest.model.js"
import returnItemModel from "../../../DB/models/returnItem.model.js"
import refundModel from "../../../DB/models/refund.model.js"
import * as RV from "./return.validation.js"
import * as RS from "./return.service.js"
import { listHandler, getOneHandler } from "../../../common/factories/crud.factory.js"
import validation from "../../../common/middleware/validation.js"
import { idParamSchema, listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"

const returnRouter = Router({ caseSensitive: true, strict: true })

const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
const authenticateCustomer = authentication({ accountType: accountTypeEnum.user })
// FR-RET-04: approval restricted to Admin/Sales (+ Owner).
const approveReturns = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin, staffRoleEnum.sales] })
// FR-RET-05: physical receipt/inspection is an Inventory function.
const inspectReturns = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin, staffRoleEnum.inventory] })
// FR-ADMIN-06: refunds are an Accountant function.
const manageRefunds = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin, staffRoleEnum.accountant] })
const viewReturns = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin, staffRoleEnum.sales, staffRoleEnum.inventory, staffRoleEnum.accountant] })

// ---- Customer ----
returnRouter.post("/", authenticateCustomer, validation(RV.createReturnRequestSchema), RS.createReturnRequest)

// ---- Staff ----
returnRouter.get(
    "/",
    authenticateStaff,
    viewReturns,
    validation(listQuerySchema),
    listHandler({ model: returnRequestModel, populate: ["order", "reviewedBy"] })
)
returnRouter.get(
    "/:id",
    authenticateStaff,
    viewReturns,
    validation(idParamSchema),
    getOneHandler({ model: returnRequestModel, populate: ["order", "reviewedBy"], notFoundMessage: "return request NOT FOUND" })
)
returnRouter.get(
    "/:id/items",
    authenticateStaff,
    viewReturns,
    validation(idParamSchema),
    listHandler({ model: returnItemModel, populate: ["orderItem"], buildFilter: (req) => ({ returnRequest: req.params.id }) })
)

returnRouter.patch("/:id/decision", authenticateStaff, approveReturns, validation({ ...idParamSchema, ...RV.decisionSchema }), RS.decide)
returnRouter.patch("/:id/inspect", authenticateStaff, inspectReturns, validation({ ...idParamSchema, ...RV.inspectSchema }), RS.inspect)

returnRouter.post("/:id/refund", authenticateStaff, manageRefunds, validation({ ...idParamSchema, ...RV.createRefundSchema }), RS.createRefund)
returnRouter.patch("/refunds/:id/complete", authenticateStaff, manageRefunds, validation(idParamSchema), RS.completeRefund)
returnRouter.get(
    "/refunds/list",
    authenticateStaff,
    manageRefunds,
    validation(listQuerySchema),
    listHandler({ model: refundModel, populate: ["returnRequest", "processedBy"] })
)

export default returnRouter
