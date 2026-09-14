import { Router } from "express"
import categoryModel from "../../../DB/models/category.model.js"
import * as CV from "./category.validation.js"
import { listHandler, getOneHandler, createHandler, updateHandler, deleteHandler } from "../../../common/factories/crud.factory.js"
import validation from "../../../common/middleware/validation.js"
import { idParamSchema, listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"

const categoryRouter = Router({ caseSensitive: true, strict: true })

const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
// FR-ADMIN-02/04: catalog structure is managed by Owner, Admin, and Inventory.
const manageCatalog = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin, staffRoleEnum.inventory] })

// FR-CAT-02: public storefront browsing, no auth required.
categoryRouter.get("/", validation(listQuerySchema), listHandler({ model: categoryModel }))
categoryRouter.get("/:id", validation(idParamSchema), getOneHandler({ model: categoryModel, notFoundMessage: "category NOT FOUND" }))

categoryRouter.post(
    "/",
    authenticateStaff,
    manageCatalog,
    validation(CV.createCategorySchema),
    createHandler({ model: categoryModel, message: "category created" })
)

categoryRouter.patch(
    "/:id",
    authenticateStaff,
    manageCatalog,
    validation({ ...idParamSchema, ...CV.updateCategorySchema }),
    updateHandler({ model: categoryModel, notFoundMessage: "category NOT FOUND", message: "category updated" })
)

categoryRouter.delete(
    "/:id",
    authenticateStaff,
    manageCatalog,
    validation(idParamSchema),
    deleteHandler({ model: categoryModel, notFoundMessage: "category NOT FOUND" })
)

export default categoryRouter
