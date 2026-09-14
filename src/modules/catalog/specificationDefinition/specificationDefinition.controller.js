import { Router } from "express"
import specificationDefinitionModel from "../../../DB/models/specificationDefinition.model.js"
import * as SDV from "./specificationDefinition.validation.js"
import { listHandler, getOneHandler, createHandler, updateHandler, deleteHandler } from "../../../common/factories/crud.factory.js"
import validation from "../../../common/middleware/validation.js"
import { idParamSchema, listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"

const specificationDefinitionRouter = Router({ caseSensitive: true, strict: true })

const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
const manageCatalog = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin, staffRoleEnum.inventory] })

// FR-SEARCH-02: category filters are read publicly by the storefront.
specificationDefinitionRouter.get(
    "/",
    validation(listQuerySchema),
    listHandler({
        model: specificationDefinitionModel,
        buildFilter: (req) => (req.query.category ? { category: req.query.category } : {})
    })
)
specificationDefinitionRouter.get(
    "/:id",
    validation(idParamSchema),
    getOneHandler({ model: specificationDefinitionModel, notFoundMessage: "specification definition NOT FOUND" })
)

specificationDefinitionRouter.post(
    "/",
    authenticateStaff,
    manageCatalog,
    validation(SDV.createSpecDefinitionSchema),
    createHandler({ model: specificationDefinitionModel, message: "specification definition created" })
)

specificationDefinitionRouter.patch(
    "/:id",
    authenticateStaff,
    manageCatalog,
    validation({ ...idParamSchema, ...SDV.updateSpecDefinitionSchema }),
    updateHandler({ model: specificationDefinitionModel, notFoundMessage: "specification definition NOT FOUND", message: "specification definition updated" })
)

specificationDefinitionRouter.delete(
    "/:id",
    authenticateStaff,
    manageCatalog,
    validation(idParamSchema),
    deleteHandler({ model: specificationDefinitionModel, notFoundMessage: "specification definition NOT FOUND" })
)

export default specificationDefinitionRouter
