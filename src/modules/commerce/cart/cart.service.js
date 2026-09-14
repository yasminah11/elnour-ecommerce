import cartModel from "../../../DB/models/cart.model.js"
import cartItemModel from "../../../DB/models/cartItem.model.js"
import productVariantModel from "../../../DB/models/productVariant.model.js"
import inventoryRecordModel from "../../../DB/models/inventoryRecord.model.js"
import * as db_service from "../../../DB/db.service.js"
import successResponse from "../../../common/utils/successes_response/succsses.response.js"

// FR-CART-01: guests can add to cart without registering. req.auth is set by
// optionalAuthentication when a valid customer token is present; otherwise a
// guest must send an "x-session-id" header the frontend generates/persists
// itself (localStorage/cookie) — a purely technical identifier, not a
// business rule.
const resolveCartOwner = (req) => {
    if (req.auth) {
        return { user: req.auth._id }
    }
    const sessionId = req.headers["x-session-id"]
    if (!sessionId) {
        throw new Error("either sign in or send an x-session-id header for a guest cart", { cause: 400 })
    }
    return { sessionId }
}

const getOrCreateCart = async (owner) => {
    let cart = await db_service.findOne({ model: cartModel, check: owner })
    if (!cart) {
        cart = await db_service.create({ model: cartModel, dataa: owner })
    }
    return cart
}

export const getCart = async (req, res, next) => {
    const owner = resolveCartOwner(req)
    const cart = await getOrCreateCart(owner)
    const items = await db_service.find({ model: cartItemModel, filteration: { cart: cart._id } })
    successResponse({ res, data: { cart, items } })
}

// FR-CART-02/03: add a product, validating availability/quantity against
// InventoryRecord before it is accepted.
export const addItem = async (req, res, next) => {
    const { variant, quantity } = req.body
    const owner = resolveCartOwner(req)

    const variantDoc = await db_service.findOne({ model: productVariantModel, check: { _id: variant, isActive: true } })
    if (!variantDoc) {
        throw new Error("المنتج غير موجود", { cause: 404 })
    }

    const inventory = await db_service.findOne({ model: inventoryRecordModel, check: { variant } })
    if (!inventory || inventory.quantity < quantity) {
        throw new Error("الكمية المطلوبة غير متوفرة في المخزون حاليًا", { cause: 409 })
    }

    const cart = await getOrCreateCart(owner)

    let item = await db_service.findOne({ model: cartItemModel, check: { cart: cart._id, variant } })
    if (item) {
        item.quantity += quantity
        await item.save()
    } else {
        item = await db_service.create({ model: cartItemModel, dataa: { cart: cart._id, variant, quantity } })
    }

    successResponse({ res, status: 201, message: "item added to cart", data: item })
}

export const updateItem = async (req, res, next) => {
    const { itemId } = req.params
    const { quantity } = req.body
    const owner = resolveCartOwner(req)
    const cart = await getOrCreateCart(owner)

    const item = await db_service.findOne({ model: cartItemModel, check: { _id: itemId, cart: cart._id } })
    if (!item) {
        throw new Error("هذا العنصر غير موجود في السلة", { cause: 404 })
    }

    const inventory = await db_service.findOne({ model: inventoryRecordModel, check: { variant: item.variant } })
    if (!inventory || inventory.quantity < quantity) {
        throw new Error("الكمية المطلوبة غير متوفرة في المخزون حاليًا", { cause: 409 })
    }

    item.quantity = quantity
    await item.save()
    successResponse({ res, message: "cart item updated", data: item })
}

export const removeItem = async (req, res, next) => {
    const { itemId } = req.params
    const owner = resolveCartOwner(req)
    const cart = await getOrCreateCart(owner)

    const item = await cartItemModel.findOneAndDelete({ _id: itemId, cart: cart._id })
    if (!item) {
        throw new Error("هذا العنصر غير موجود في السلة", { cause: 404 })
    }
    successResponse({ res, message: "cart item removed" })
}

export const clearCart = async (req, res, next) => {
    const owner = resolveCartOwner(req)
    const cart = await getOrCreateCart(owner)
    await db_service.deleteMany({ model: cartItemModel, check: { cart: cart._id } })
    successResponse({ res, message: "cart cleared" })
}