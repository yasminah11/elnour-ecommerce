import auditLogModel from "../../DB/models/auditLog.model.js"
import { auditOutcomeEnum } from "../enum/audit.enum.js"

// NFR-SEC-05 / FR-ADMIN-08: every privileged mutation of stock, order state,
// payment, refund, role, or configuration is auditable. Called from the
// service layer of the sensitive operations (order status changes, refunds,
// inventory adjustments, staff provisioning, ...), never from a public route
// directly, so the caller always supplies the real actor.
// Best-effort: a logging failure must never block the business operation it
// is describing, so errors here are swallowed (and could be piped to a
// process-level logger in production).
export const writeAudit = async ({ actor, actorModel, action, targetType, targetId = null, outcome = auditOutcomeEnum.success, metadata = {} }) => {
    try {
        await auditLogModel.create({ actor, actorModel, action, targetType, targetId, outcome, metadata })
    } catch (err) {
        console.error("audit log write failed:", err.message)
    }
}
