import { Router } from "express"
import productImageModel from "../../../DB/models/productImage.model.js"
import * as PIV from "./productImage.validation.js"
import { listHandler, getOneHandler, createHandler, updateHandler, deleteHandler } from "../../../common/factories/crud.factory.js"
import validation from "../../../common/middleware/validation.js"
import { idParamSchema, listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"

const productImageRouter = Router({ caseSensitive: true, strict: true })

const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
const manageCatalog = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin, staffRoleEnum.inventory] })

productImageRouter.get(
    "/",
    validation(listQuerySchema),
    listHandler({
        model: productImageModel,
        buildFilter: (req) => (req.query.variant ? { variant: req.query.variant } : {})
    })
)
productImageRouter.get(
    "/:id",
    validation(idParamSchema),
    getOneHandler({ model: productImageModel, notFoundMessage: "product image NOT FOUND" })
)

productImageRouter.post(
    "/",
    authenticateStaff,
    manageCatalog,
    validation(PIV.createProductImageSchema),
    createHandler({ model: productImageModel, message: "product image created" })
)

productImageRouter.patch(
    "/:id",
    authenticateStaff,
    manageCatalog,
    validation({ ...idParamSchema, ...PIV.updateProductImageSchema }),
    updateHandler({ model: productImageModel, notFoundMessage: "product image NOT FOUND", message: "product image updated" })
)

productImageRouter.delete(
    "/:id",
    authenticateStaff,
    manageCatalog,
    validation(idParamSchema),
    deleteHandler({ model: productImageModel, notFoundMessage: "product image NOT FOUND" })
)

export default productImageRouter
