import { Router } from "express"
import couponModel from "../../../DB/models/coupon.model.js"
import * as CV from "./coupon.validation.js"
import { listHandler, getOneHandler, createHandler, updateHandler, deleteHandler } from "../../../common/factories/crud.factory.js"
import validation from "../../../common/middleware/validation.js"
import { idParamSchema, listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"
import * as db_service from "../../../DB/db.service.js"
import successResponse from "../../../common/utils/successes_response/succsses.response.js"

const couponRouter = Router({ caseSensitive: true, strict: true })

const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
const manageCoupons = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin] })

// FR-PROMO-06: customer-facing check, at checkout, before the coupon is
// actually applied — reused inside order.service.js's checkout too.
couponRouter.get("/validate/:code", async (req, res, next) => {
    const coupon = await db_service.findOne({ model: couponModel, check: { code: req.params.code.toUpperCase(), isActive: true } })
    if (!coupon) throw new Error("invalid coupon", { cause: 404 })
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new Error("coupon expired", { cause: 409 })
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) throw new Error("coupon usage limit reached", { cause: 409 })
    successResponse({ res, data: coupon })
})

couponRouter.get(
    "/",
    authenticateStaff,
    manageCoupons,
    validation(listQuerySchema),
    listHandler({ model: couponModel, populate: ["restrictedCategories"] })
)
couponRouter.get(
    "/:id",
    authenticateStaff,
    manageCoupons,
    validation(idParamSchema),
    getOneHandler({ model: couponModel, populate: ["restrictedCategories"], notFoundMessage: "coupon NOT FOUND" })
)
couponRouter.post(
    "/",
    authenticateStaff,
    manageCoupons,
    validation(CV.createCouponSchema),
    createHandler({ model: couponModel, message: "coupon created" })
)
couponRouter.patch(
    "/:id",
    authenticateStaff,
    manageCoupons,
    validation({ ...idParamSchema, ...CV.updateCouponSchema }),
    updateHandler({ model: couponModel, notFoundMessage: "coupon NOT FOUND", message: "coupon updated" })
)
couponRouter.delete(
    "/:id",
    authenticateStaff,
    manageCoupons,
    validation(idParamSchema),
    deleteHandler({ model: couponModel, notFoundMessage: "coupon NOT FOUND" })
)

export default couponRouter
