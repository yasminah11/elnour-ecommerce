// NFR-SEC-05: administrative/high-impact actions are logged with actor,
// timestamp, target, action, and outcome.
export const auditOutcomeEnum = {
    success: "success",
    failure: "failure"
}

// Section 9.3 / BR-14: some sensitive actions can be performed by staff, and
// some (customer-initiated cancellation) by a customer account, so the actor
// is polymorphic between "staff" and "auth".
export const actorModelEnum = {
    staff: "staff",
    auth: "auth"
}
