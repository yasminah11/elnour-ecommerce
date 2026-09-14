import { Router } from "express"
import productModel from "../../../DB/models/product.model.js"
import * as PV from "./product.validation.js"
import { listHandler, getOneHandler, createHandler, updateHandler, deleteHandler } from "../../../common/factories/crud.factory.js"
import validation from "../../../common/middleware/validation.js"
import { idParamSchema, listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"

const productRouter = Router({ caseSensitive: true, strict: true })

const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
const manageCatalog = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin, staffRoleEnum.inventory] })

// FR-CAT-01/08: catalog browsing is public.
productRouter.get(
    "/",
    validation(listQuerySchema),
    listHandler({
        model: productModel,
        populate: ["category"],
        buildFilter: (req) => {
            const filter = {}
            if (req.query.category) filter.category = req.query.category
            if (req.query.q) filter.name = { $regex: req.query.q, $options: "i" } // FR-SEARCH-01
            return filter
        }
    })
)
productRouter.get(
    "/:id",
    validation(idParamSchema),
    getOneHandler({ model: productModel, populate: ["category"], notFoundMessage: "product NOT FOUND" })
)

productRouter.post(
    "/",
    authenticateStaff,
    manageCatalog,
    validation(PV.createProductSchema),
    createHandler({ model: productModel, message: "product created" })
)

productRouter.patch(
    "/:id",
    authenticateStaff,
    manageCatalog,
    validation({ ...idParamSchema, ...PV.updateProductSchema }),
    updateHandler({ model: productModel, notFoundMessage: "product NOT FOUND", message: "product updated" })
)

productRouter.delete(
    "/:id",
    authenticateStaff,
    manageCatalog,
    validation(idParamSchema),
    deleteHandler({ model: productModel, notFoundMessage: "product NOT FOUND" })
)

export default productRouter
