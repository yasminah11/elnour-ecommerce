// FR-FLOW-01: initial lifecycle. FR-FLOW-02: not every order uses every
// status (pickup orders may skip shipping-specific statuses).
export const orderStatusEnum = {
    pendingPayment: "pendingPayment",
    paymentConfirmed: "paymentConfirmed",
    orderConfirmed: "orderConfirmed",
    preparing: "preparing",
    readyForPickup: "readyForPickup",
    shipped: "shipped",
    outForDelivery: "outForDelivery",
    delivered: "delivered",
    cancelled: "cancelled",
    returnRequested: "returnRequested",
    returnApproved: "returnApproved",
    returned: "returned",
    refunded: "refunded"
}

// FR-ORDER-02
export const fulfillmentMethodEnum = {
    pickup: "pickup",
    delivery: "delivery"
}

// FR-ORDER-03 / FR-PAY-01: COD and store pickup are the initial methods.
// BR-08 / FR-ORDER-04: online digital payments are deferred (P3) and are
// intentionally NOT listed here so the schema does not silently imply they
// are already supported.
export const paymentMethodEnum = {
    cashOnDelivery: "cashOnDelivery",
    storePickup: "storePickup"
}

export const currencyEnum = {
    egp: "EGP",
    usd: "USD"
}
