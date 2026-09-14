import { Router } from "express"
import wishlistItemModel from "../../../DB/models/wishlistItem.model.js"
import * as WV from "./wishlist.validation.js"
import { listHandler, deleteHandler } from "../../../common/factories/crud.factory.js"
import * as db_service from "../../../DB/db.service.js"
import successResponse from "../../../common/utils/successes_response/succsses.response.js"
import validation from "../../../common/middleware/validation.js"
import { idParamSchema, listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { accountTypeEnum } from "../../../common/enum/auth.enum.js"

const wishlistRouter = Router({ caseSensitive: true, strict: true })

// FR-CART-04: unlike the guest-friendly Cart, wishlist requires a real account.
const authenticateCustomer = authentication({ accountType: accountTypeEnum.user })

wishlistRouter.get(
    "/",
    authenticateCustomer,
    validation(listQuerySchema),
    listHandler({ model: wishlistItemModel, populate: ["variant"], buildFilter: (req) => ({ user: req.auth._id }) })
)

wishlistRouter.post("/", authenticateCustomer, validation(WV.addWishlistItemSchema), async (req, res, next) => {
    const { variant } = req.body
    const existing = await db_service.findOne({ model: wishlistItemModel, check: { user: req.auth._id, variant } })
    if (existing) {
        return successResponse({ res, message: "already in wishlist", data: existing })
    }
    const item = await db_service.create({ model: wishlistItemModel, dataa: { user: req.auth._id, variant } })
    successResponse({ res, status: 201, message: "added to wishlist", data: item })
})

wishlistRouter.delete(
    "/:id",
    authenticateCustomer,
    validation(idParamSchema),
    deleteHandler({ model: wishlistItemModel, notFoundMessage: "wishlist item NOT FOUND" })
)

export default wishlistRouter
