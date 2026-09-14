// FR-PROMO-01/02/03: percentage, fixed-amount, Buy X Get Y, X+Y% promos.
export const promoTypeEnum = {
    percentage: "percentage",
    fixedAmount: "fixedAmount",
    buyXGetY: "buyXGetY",
    xPlusYPercent: "xPlusYPercent"
}

// FR-PROMO-01: coupon discount type (coupons are always percentage or fixed,
// the more complex promo types belong to Promotion, not Coupon).
export const couponDiscountTypeEnum = {
    percentage: "percentage",
    fixedAmount: "fixedAmount"
}
