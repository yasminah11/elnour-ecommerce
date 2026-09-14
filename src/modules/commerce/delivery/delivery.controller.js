import { Router } from "express"
import deliveryModel from "../../../DB/models/delivery.model.js"
import * as DV from "./delivery.validation.js"
import * as DS from "./delivery.service.js"
import { listHandler, getOneHandler, createHandler } from "../../../common/factories/crud.factory.js"
import validation from "../../../common/middleware/validation.js"
import { idParamSchema, listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"

const deliveryRouter = Router({ caseSensitive: true, strict: true })

const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
const authenticateCustomer = authentication({ accountType: accountTypeEnum.user })
// FR-ADMIN-05: Delivery role owns fulfillment/delivery functions.
const manageDelivery = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin, staffRoleEnum.delivery] })

deliveryRouter.post(
    "/",
    authenticateStaff,
    manageDelivery,
    validation(DV.createDeliverySchema),
    createHandler({ model: deliveryModel, message: "delivery created" })
)
deliveryRouter.get(
    "/",
    authenticateStaff,
    manageDelivery,
    validation(listQuerySchema),
    listHandler({ model: deliveryModel, populate: ["order", "assignedEmployee"] })
)
deliveryRouter.get(
    "/:id",
    authenticateStaff,
    manageDelivery,
    validation(idParamSchema),
    getOneHandler({ model: deliveryModel, populate: ["order", "assignedEmployee"], notFoundMessage: "delivery NOT FOUND" })
)
deliveryRouter.patch(
    "/:id/tracking",
    authenticateStaff,
    manageDelivery,
    validation({ ...idParamSchema, ...DV.updateTrackingSchema }),
    DS.updateTracking
)

// FR-DEL-07: customer tracking.
deliveryRouter.get("/mine/:orderId", authenticateCustomer, DS.myDelivery)

export default deliveryRouter
