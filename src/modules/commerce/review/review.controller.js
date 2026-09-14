import { Router } from "express"
import reviewModel from "../../../DB/models/review.model.js"
import * as RVV from "./review.validation.js"
import * as RVS from "./review.service.js"
import { listHandler, updateHandler } from "../../../common/factories/crud.factory.js"
import validation from "../../../common/middleware/validation.js"
import { idParamSchema, listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"
import { reviewStatusEnum } from "../../../common/enum/review.enum.js"

const reviewRouter = Router({ caseSensitive: true, strict: true })

const authenticateCustomer = authentication({ accountType: accountTypeEnum.user })
const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
const moderateReviews = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin] })

// Public: only published reviews are shown on the storefront.
reviewRouter.get(
    "/",
    validation(listQuerySchema),
    listHandler({
        model: reviewModel,
        populate: ["user"],
        buildFilter: (req) => ({
            status: reviewStatusEnum.published,
            ...(req.query.variant ? { variant: req.query.variant } : {})
        })
    })
)

reviewRouter.post("/", authenticateCustomer, validation(RVV.createReviewSchema), RVS.createReview)

// FR-REV-04: manual moderation override.
reviewRouter.patch(
    "/:id/moderate",
    authenticateStaff,
    moderateReviews,
    validation({ ...idParamSchema, ...RVV.moderateReviewSchema }),
    updateHandler({ model: reviewModel, notFoundMessage: "review NOT FOUND", message: "review moderated" })
)

export default reviewRouter
