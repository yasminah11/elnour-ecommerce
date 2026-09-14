// FR-DEL-07: customers can see delivery/order tracking status.
// FR-DEL-06: courier API integration is deferred — status is updated
// manually by an authorized Delivery employee in this release.
export const deliveryTrackingStatusEnum = {
    preparing: "preparing",
    shipped: "shipped",
    outForDelivery: "outForDelivery",
    delivered: "delivered",
    exception: "exception"
}
