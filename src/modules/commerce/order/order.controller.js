import { Router } from "express"
import orderModel from "../../../DB/models/order.model.js"
import orderStatusHistoryModel from "../../../DB/models/orderStatusHistory.model.js"
import * as OV from "./order.validation.js"
import * as OS from "./order.service.js"
import { listHandler, getOneHandler } from "../../../common/factories/crud.factory.js"
import validation from "../../../common/middleware/validation.js"
import { idParamSchema, listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"

const orderRouter = Router({ caseSensitive: true, strict: true })

const authenticateCustomer = authentication({ accountType: accountTypeEnum.user })
const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
// FR-ADMIN-03/04/05: Sales/Delivery/Admin/Owner all touch order lifecycle.
const viewOrders = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin, staffRoleEnum.sales, staffRoleEnum.delivery] })
// FR-RET-04 style restriction reused here for staff-side cancellation.
const cancelOrders = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin, staffRoleEnum.sales] })

// ---- Customer-facing ----
orderRouter.post("/checkout", authenticateCustomer, validation(OV.checkoutSchema), OS.checkout)
orderRouter.get("/mine", authenticateCustomer, OS.myOrders)
orderRouter.get("/mine/:id", authenticateCustomer, validation(idParamSchema), OS.myOrderById)
// FR-ORDER-07
orderRouter.patch("/mine/:id/cancel", authenticateCustomer, validation({ ...idParamSchema, ...OV.cancelOrderSchema }), OS.cancelByCustomer)

// ---- Staff-facing ----
orderRouter.get(
    "/",
    authenticateStaff,
    viewOrders,
    validation(listQuerySchema),
    listHandler({
        model: orderModel,
        populate: ["user"],
        buildFilter: (req) => (req.query.status ? { status: req.query.status } : {})
    })
)
orderRouter.get(
    "/:id",
    authenticateStaff,
    viewOrders,
    validation(idParamSchema),
    getOneHandler({ model: orderModel, populate: ["user"], notFoundMessage: "order NOT FOUND" })
)
orderRouter.get(
    "/:id/history",
    authenticateStaff,
    viewOrders,
    validation(idParamSchema),
    listHandler({ model: orderStatusHistoryModel, populate: ["actor"], buildFilter: (req) => ({ order: req.params.id }) })
)
// FR-ORDER-08
orderRouter.patch(
    "/:id/cancel",
    authenticateStaff,
    cancelOrders,
    validation({ ...idParamSchema, ...OV.cancelOrderSchema }),
    OS.cancelByStaff
)
// FR-ORDER-09 / FR-FLOW-03
orderRouter.patch(
    "/:id/status",
    authenticateStaff,
    viewOrders,
    validation({ ...idParamSchema, ...OV.changeStatusSchema }),
    OS.changeStatus
)

export default orderRouter
