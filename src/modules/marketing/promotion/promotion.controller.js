import { Router } from "express"
import promotionModel from "../../../DB/models/promotion.model.js"
import * as PV from "./promotion.validation.js"
import { listHandler, getOneHandler, createHandler, updateHandler, deleteHandler } from "../../../common/factories/crud.factory.js"
import validation from "../../../common/middleware/validation.js"
import { idParamSchema, listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"

const promotionRouter = Router({ caseSensitive: true, strict: true })

const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
const managePromotions = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin] })

promotionRouter.get(
    "/",
    validation(listQuerySchema),
    listHandler({ model: promotionModel, populate: ["variants"], buildFilter: () => ({ isActive: true }) })
)
promotionRouter.get(
    "/:id",
    validation(idParamSchema),
    getOneHandler({ model: promotionModel, populate: ["variants"], notFoundMessage: "promotion NOT FOUND" })
)

promotionRouter.post(
    "/",
    authenticateStaff,
    managePromotions,
    validation(PV.createPromotionSchema),
    createHandler({ model: promotionModel, message: "promotion created" })
)
promotionRouter.patch(
    "/:id",
    authenticateStaff,
    managePromotions,
    validation({ ...idParamSchema, ...PV.updatePromotionSchema }),
    updateHandler({ model: promotionModel, notFoundMessage: "promotion NOT FOUND", message: "promotion updated" })
)
promotionRouter.delete(
    "/:id",
    authenticateStaff,
    managePromotions,
    validation(idParamSchema),
    deleteHandler({ model: promotionModel, notFoundMessage: "promotion NOT FOUND" })
)

export default promotionRouter
