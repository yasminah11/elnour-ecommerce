// Convenience barrel — import { orderModel, invoiceModel } from "../DB/models/index.js"
// instead of one import line per file. Individual files can still be
// imported directly (existing auth/staff modules already do that).

// Accounts (existing)
export { default as authModel } from "./auth.model.js"
export { default as staffModel } from "./staff.model.js"
export { default as revokeTokenModel } from "./revokeToken.model.js"

// Accounts & Catalog domain
export { default as categoryModel } from "./category.model.js"
export { default as productModel } from "./product.model.js"
export { default as productVariantModel } from "./productVariant.model.js"
export { default as specificationDefinitionModel } from "./specificationDefinition.model.js"
export { default as specificationValueModel } from "./specificationValue.model.js"
export { default as productImageModel } from "./productImage.model.js"
export { default as inventoryRecordModel } from "./inventoryRecord.model.js"
export { default as inventoryAdjustmentModel } from "./inventoryAdjustment.model.js"

// Orders & Commerce domain
export { default as cartModel } from "./cart.model.js"
export { default as cartItemModel } from "./cartItem.model.js"
export { default as wishlistItemModel } from "./wishlistItem.model.js"
export { default as orderModel } from "./order.model.js"
export { default as orderItemModel } from "./orderItem.model.js"
export { default as orderStatusHistoryModel } from "./orderStatusHistory.model.js"
export { default as paymentRecordModel } from "./paymentRecord.model.js"
export { default as invoiceModel } from "./invoice.model.js"
export { default as invoiceItemModel } from "./invoiceItem.model.js"
export { default as deliveryModel } from "./delivery.model.js"
export { default as returnRequestModel } from "./returnRequest.model.js"
export { default as returnItemModel } from "./returnItem.model.js"
export { default as refundModel } from "./refund.model.js"
export { default as reviewModel } from "./review.model.js"
export { default as notificationModel } from "./notification.model.js"
export { default as couponModel } from "./coupon.model.js"
export { default as promotionModel } from "./promotion.model.js"

// Cross-cutting
export { default as auditLogModel } from "./auditLog.model.js"
export { default as exchangeRateModel } from "./exchangeRate.model.js"
