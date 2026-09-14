// FR-CAT-06 / FR-INV-05: Out of Stock products stay visible, they are not removed.
// FR-CAT-07 / TBD-08: preorder is a supported state, but the exact preorder
// fulfillment/deposit policy is TBD-08 — this enum only names the state, it
// does not encode any deposit/priority rule.
export const availabilityStatusEnum = {
    inStock: "inStock",
    outOfStock: "outOfStock",
    preorder: "preorder"
}

// FR-CAT-04: administrators define specification fields dynamically without a
// code deployment, so the *type* of a spec field must be data, not code.
export const specFieldTypeEnum = {
    text: "text",
    number: "number",
    boolean: "boolean",
    select: "select"
}
