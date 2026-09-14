import { Router } from "express"
import exchangeRateModel from "../../../DB/models/exchangeRate.model.js"
import * as EV from "./exchangeRate.validation.js"
import { listHandler } from "../../../common/factories/crud.factory.js"
import * as db_service from "../../../DB/db.service.js"
import successResponse from "../../../common/utils/successes_response/succsses.response.js"
import validation from "../../../common/middleware/validation.js"
import { listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"
import { writeAudit } from "../../../common/utils/audit.util.js"
import { actorModelEnum } from "../../../common/enum/audit.enum.js"

const exchangeRateRouter = Router({ caseSensitive: true, strict: true })

const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
const manageRate = authorization({ roles: [staffRoleEnum.owner, staffRoleEnum.admin, staffRoleEnum.accountant] })

// FR-PAY-05: public, since USD price display needs the current rate.
exchangeRateRouter.get("/current", async (req, res, next) => {
    const rate = await exchangeRateModel.findOne({ isActive: true }).sort({ effectiveAt: -1 })
    if (!rate) throw new Error("no active exchange rate configured (TBD-03)", { cause: 404 })
    successResponse({ res, data: rate })
})

exchangeRateRouter.get(
    "/",
    authenticateStaff,
    manageRate,
    validation(listQuerySchema),
    listHandler({ model: exchangeRateModel, populate: ["setBy"] })
)

// TBD-03: source of the rate stays free-form / nullable, only the value is
// enforced. Setting a new rate deactivates the previous one so "current" is
// always unambiguous, while old rows are kept for history (NFR-DATA-03).
exchangeRateRouter.post(
    "/",
    authenticateStaff,
    manageRate,
    validation(EV.createExchangeRateSchema),
    async (req, res, next) => {
        const { rate, source } = req.body
        await exchangeRateModel.updateMany({ isActive: true }, { isActive: false })
        const created = await db_service.create({
            model: exchangeRateModel,
            dataa: { rate, source, setBy: req.auth._id, isActive: true }
        })
        await writeAudit({
            actor: req.auth._id,
            actorModel: actorModelEnum.staff,
            action: "exchangeRate.set",
            targetType: "exchangeRate",
            targetId: created._id,
            metadata: { rate, source }
        })
        successResponse({ res, status: 201, message: "exchange rate set", data: created })
    }
)

export default exchangeRateRouter
