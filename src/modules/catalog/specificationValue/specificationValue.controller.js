import { Router } from "express"
import specificationValueModel from "../../../DB/models/specificationValue.model.js"
import * as SVV from "./specificationValue.validation.js"
import { listHandler, getOneHandler, createHandler, updateHandler, deleteHandler } from "../../../common/factories/crud.factory.js"
import validation from "../../../common/middleware/validation.js"
import { idParamSchema, listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"

const specificationValueRouter = Router({ caseSensitive: true, strict: true })

const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
const manageCatalog = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin, staffRoleEnum.inventory] })

// FR-CAT-03: a variant's spec values are shown on its public product page.
specificationValueRouter.get(
    "/",
    validation(listQuerySchema),
    listHandler({
        model: specificationValueModel,
        populate: ["specificationDefinition"],
        buildFilter: (req) => (req.query.variant ? { variant: req.query.variant } : {})
    })
)
specificationValueRouter.get(
    "/:id",
    validation(idParamSchema),
    getOneHandler({ model: specificationValueModel, populate: ["specificationDefinition"], notFoundMessage: "specification value NOT FOUND" })
)

specificationValueRouter.post(
    "/",
    authenticateStaff,
    manageCatalog,
    validation(SVV.createSpecValueSchema),
    createHandler({ model: specificationValueModel, message: "specification value created" })
)

specificationValueRouter.patch(
    "/:id",
    authenticateStaff,
    manageCatalog,
    validation({ ...idParamSchema, ...SVV.updateSpecValueSchema }),
    updateHandler({ model: specificationValueModel, notFoundMessage: "specification value NOT FOUND", message: "specification value updated" })
)

specificationValueRouter.delete(
    "/:id",
    authenticateStaff,
    manageCatalog,
    validation(idParamSchema),
    deleteHandler({ model: specificationValueModel, notFoundMessage: "specification value NOT FOUND" })
)

export default specificationValueRouter
