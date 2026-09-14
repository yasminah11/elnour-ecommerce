import { Router } from "express"
import productVariantModel from "../../../DB/models/productVariant.model.js"
import * as PVV from "./productVariant.validation.js"
import * as PVS from "./productVariant.service.js"
import { listHandler, getOneHandler, updateHandler } from "../../../common/factories/crud.factory.js"
import validation from "../../../common/middleware/validation.js"
import { idParamSchema, listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"

const productVariantRouter = Router({ caseSensitive: true, strict: true })

const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
const manageCatalog = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin, staffRoleEnum.inventory] })

// FR-CAT-06: Out of Stock variants stay visible, so listing/reading is public
// with no availabilityStatus filter enforced here.
productVariantRouter.get(
    "/",
    validation(listQuerySchema),
    listHandler({
        model: productVariantModel,
        populate: ["product"],
        buildFilter: (req) => (req.query.product ? { product: req.query.product } : {})
    })
)
productVariantRouter.get(
    "/:id",
    validation(idParamSchema),
    getOneHandler({ model: productVariantModel, populate: ["product"], notFoundMessage: "variant NOT FOUND" })
)

productVariantRouter.post(
    "/",
    authenticateStaff,
    manageCatalog,
    validation(PVV.createVariantSchema),
    PVS.createVariant
)

productVariantRouter.patch(
    "/:id",
    authenticateStaff,
    manageCatalog,
    validation({ ...idParamSchema, ...PVV.updateVariantSchema }),
    updateHandler({ model: productVariantModel, notFoundMessage: "variant NOT FOUND", message: "variant updated" })
)

productVariantRouter.delete(
    "/:id",
    authenticateStaff,
    manageCatalog,
    validation(idParamSchema),
    PVS.deleteVariant
)

export default productVariantRouter
