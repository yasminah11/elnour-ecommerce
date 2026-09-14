import { Router } from "express"
import * as CS from "./cart.service.js"
import * as CVA from "./cart.validation.js"
import validation from "../../../common/middleware/validation.js"
import { optionalAuthentication } from "../../../common/middleware/auth.js"
import { accountTypeEnum } from "../../../common/enum/auth.enum.js"

const cartRouter = Router({ caseSensitive: true, strict: true })

// FR-CART-01: guest-friendly — populates req.auth only if a valid customer
// token is present, otherwise the service falls back to a guest sessionId.
const identifyCustomer = optionalAuthentication({ accountType: accountTypeEnum.user })

cartRouter.get("/", identifyCustomer, CS.getCart)
cartRouter.post("/items", identifyCustomer, validation(CVA.addItemSchema), CS.addItem)
cartRouter.patch("/items/:itemId", identifyCustomer, validation(CVA.updateItemSchema), CS.updateItem)
cartRouter.delete("/items/:itemId", identifyCustomer, validation(CVA.itemParamSchema), CS.removeItem)
cartRouter.delete("/", identifyCustomer, CS.clearCart)

export default cartRouter
