// Section 5 (Actors and Roles): Registered Customer vs Business/Company Customer
export const customerTypeEnum = {
    registered: "registered",
    business: "business"
}

// Section 5 (Actors and Roles): staff roles
// Owner, Admin, Sales Employee, Inventory Employee, Delivery Employee, Accountant, Market Analyst
export const staffRoleEnum = {
    owner: "owner",
    admin: "admin",
    sales: "sales",
    inventory: "inventory",
    delivery: "delivery",
    accountant: "accountant",
    marketAnalyst: "marketAnalyst"
}

// used inside the JWT payload to know which collection (User or Staff) the token belongs to
export const accountTypeEnum = {
    user: "user",
    staff: "staff"
}

// how the customer account credential was established: classic email/password
// sign-up, or "Sign in with Google" (OAuth)
export const authProviderEnum = {
    local: "local",
    google: "google"
}
