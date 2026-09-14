import { Router } from "express"
import auditLogModel from "../../../DB/models/auditLog.model.js"
import { listHandler, getOneHandler } from "../../../common/factories/crud.factory.js"
import validation from "../../../common/middleware/validation.js"
import { idParamSchema, listQuerySchema } from "../../../common/utils/sharedSchemas.js"
import { authentication } from "../../../common/middleware/auth.js"
import { authorization } from "../../../common/middleware/authorization.js"
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js"

const auditLogRouter = Router({ caseSensitive: true, strict: true })

const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })
// NFR-SEC-05: audit trail visibility restricted to Owner only — no
// create/update/delete routes are exposed, entries are only ever written
// internally via common/utils/audit.util.js.
const viewAudit = authorization({ roles: [staffRoleEnum.owner] })

auditLogRouter.get(
    "/",
    authenticateStaff,
    viewAudit,
    validation(listQuerySchema),
    listHandler({
        model: auditLogModel,
        populate: ["actor"],
        buildFilter: (req) => {
            const filter = {}
            if (req.query.targetType) filter.targetType = req.query.targetType
            if (req.query.targetId) filter.targetId = req.query.targetId
            return filter
        }
    })
)
auditLogRouter.get(
    "/:id",
    authenticateStaff,
    viewAudit,
    validation(idParamSchema),
    getOneHandler({ model: auditLogModel, populate: ["actor"], notFoundMessage: "audit log entry NOT FOUND" })
)

export default auditLogRouter
