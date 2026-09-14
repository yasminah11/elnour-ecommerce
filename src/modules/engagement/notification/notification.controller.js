import { Router } from "express"
import notificationModel from "../../../DB/models/notification.model.js"
import * as NV from "./notification.validation.js"
import { listHandler, createHandler } from "../../../common/factories/crud.factory.js"
import validation from "../../../common/middleware/validation.js"
import { listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"
import { recipientModelEnum } from "../../../common/enum/notification.enum.js"

const notificationRouter = Router({ caseSensitive: true, strict: true })

const authenticateCustomer = authentication({ accountType: accountTypeEnum.user })
const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
const manageNotifications = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin] })

// Every customer/staff account only ever sees its own notifications;
// broadcasting/creating is a staff-only action (system events call the
// model directly from their own services, e.g. order.service.js).
notificationRouter.get(
    "/mine",
    authenticateCustomer,
    validation(listQuerySchema),
    listHandler({ model: notificationModel, buildFilter: (req) => ({ recipient: req.auth._id, recipientModel: recipientModelEnum.auth }) })
)

notificationRouter.get(
    "/",
    authenticateStaff,
    manageNotifications,
    validation(listQuerySchema),
    listHandler({ model: notificationModel })
)

notificationRouter.post(
    "/",
    authenticateStaff,
    manageNotifications,
    validation(NV.createNotificationSchema),
    createHandler({ model: notificationModel, message: "notification queued" })
)

export default notificationRouter
