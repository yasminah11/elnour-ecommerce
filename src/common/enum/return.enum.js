// FR-RET-04: approval is manual, restricted to Admin/Sales.
// FR-RET-05: approved returns track physical receipt/inspection state.
export const returnStatusEnum = {
    requested: "requested",
    approved: "approved",
    rejected: "rejected",
    received: "received",
    inspected: "inspected",
    completed: "completed"
}

export const physicalReceiptStateEnum = {
    pending: "pending",
    received: "received",
    inspected: "inspected"
}

// FR-RET-07: refund completion is recorded separately from return approval.
// TBD-07: the exact refund-method rules are not decided yet, so this stays a
// small, easily-extended list rather than a hard business rule.
export const refundMethodEnum = {
    originalPaymentMethod: "originalPaymentMethod",
    cash: "cash",
    storeCredit: "storeCredit",
    bankTransfer: "bankTransfer"
}

export const refundStatusEnum = {
    pending: "pending",
    completed: "completed",
    rejected: "rejected"
}
