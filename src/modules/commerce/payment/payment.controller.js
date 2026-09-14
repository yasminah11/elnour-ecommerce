import { Router } from "express"
import paymentRecordModel from "../../../DB/models/paymentRecord.model.js"
import * as PV from "./payment.validation.js"
import * as PS from "./payment.service.js"
import { listHandler, getOneHandler } from "../../../common/factories/crud.factory.js"
import validation from "../../../common/middleware/validation.js"
import { idParamSchema, listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"

const paymentRouter = Router({ caseSensitive: true, strict: true })

const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
// FR-ADMIN-06: Accountant role owns payment/financial records.
const managePayments = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin, staffRoleEnum.accountant] })

paymentRouter.get(
    "/",
    authenticateStaff,
    managePayments,
    validation(listQuerySchema),
    listHandler({ model: paymentRecordModel, populate: ["order"], buildFilter: (req) => (req.query.order ? { order: req.query.order } : {}) })
)
paymentRouter.get(
    "/:id",
    authenticateStaff,
    managePayments,
    validation(idParamSchema),
    getOneHandler({ model: paymentRecordModel, populate: ["order"], notFoundMessage: "payment record NOT FOUND" })
)
paymentRouter.patch(
    "/:id/status",
    authenticateStaff,
    managePayments,
    validation({ ...idParamSchema, ...PV.updatePaymentStatusSchema }),
    PS.updateStatus
)

export default paymentRouter
