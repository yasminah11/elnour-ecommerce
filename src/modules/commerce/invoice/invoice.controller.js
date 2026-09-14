import { Router } from "express"
import invoiceModel from "../../../DB/models/invoice.model.js"
import * as IVV from "./invoice.validation.js"
import * as IVS from "./invoice.service.js"
import { listHandler, getOneHandler } from "../../../common/factories/crud.factory.js"
import validation from "../../../common/middleware/validation.js"
import { idParamSchema, listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"

const invoiceRouter = Router({ caseSensitive: true, strict: true })

const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
const authenticateCustomer = authentication({ accountType: accountTypeEnum.user })
const manageInvoices = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin, staffRoleEnum.accountant] })

invoiceRouter.post(
    "/orders/:id/generate",
    authenticateStaff,
    manageInvoices,
    validation({ ...idParamSchema, ...IVV.generateInvoiceSchema }),
    IVS.generateInvoice
)
invoiceRouter.get(
    "/",
    authenticateStaff,
    manageInvoices,
    validation(listQuerySchema),
    listHandler({ model: invoiceModel, populate: ["order"] })
)
invoiceRouter.get(
    "/:id",
    authenticateStaff,
    manageInvoices,
    validation(idParamSchema),
    getOneHandler({ model: invoiceModel, populate: ["order"], notFoundMessage: "invoice NOT FOUND" })
)

// Customer: read their own order's invoice.
invoiceRouter.get("/mine/:orderId", authenticateCustomer, IVS.myInvoice)

export default invoiceRouter
