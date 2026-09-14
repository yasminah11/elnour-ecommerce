// FR-NOTIF-02: SMS and WhatsApp are the initial external channels.
// FR-NOTIF-03: email/website channels are supported by the same extensible
// layer even if not activated until TBD-01/TBD-02 (providers) are resolved.
export const notificationChannelEnum = {
    sms: "sms",
    whatsapp: "whatsapp",
    email: "email",
    website: "website"
}

// FR-NOTIF-05: delivery attempts and failures are logged.
export const notificationStatusEnum = {
    pending: "pending",
    sent: "sent",
    failed: "failed"
}

// A notification can be addressed to a customer (auth) or a staff member
// (e.g. low-stock alerts to Inventory employees — FR-INV-06).
export const recipientModelEnum = {
    auth: "auth",
    staff: "staff"
}

// FR-NOTIF-01: events that generate a notification.
export const notificationEventEnum = {
    orderCreated: "orderCreated",
    orderStatusChanged: "orderStatusChanged",
    orderCancelled: "orderCancelled",
    returnDecision: "returnDecision",
    readyForPickup: "readyForPickup",
    backInStock: "backInStock",
    lowStock: "lowStock"
}
