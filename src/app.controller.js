import express from "express"
import checkConnectionDB from "./DB/connectionDB.js"
import successResponse from "./common/utils/successes_response/succsses.response.js"
import cors from "cors"
import compression from "compression"
import { PORT, WHITLIST } from "../config/config.service.js"
import { redisConnecition } from "./DB/redis/redis.db.js"
import helmet from "helmet"
import {rateLimit} from "express-rate-limit"
import userAuthRouter from "./modules/auth/user/user.auth.controller.js"
import staffAuthRouter from "./modules/auth/staff/staff.auth.controller.js"

// catalog
import categoryRouter from "./modules/catalog/category/category.controller.js"
import productRouter from "./modules/catalog/product/product.controller.js"
import productVariantRouter from "./modules/catalog/productVariant/productVariant.controller.js"
import specificationDefinitionRouter from "./modules/catalog/specificationDefinition/specificationDefinition.controller.js"
import specificationValueRouter from "./modules/catalog/specificationValue/specificationValue.controller.js"
import productImageRouter from "./modules/catalog/productImage/productImage.controller.js"
import inventoryRouter from "./modules/catalog/inventory/inventory.controller.js"

// commerce
import orderRouter from "./modules/commerce/order/order.controller.js"
import paymentRouter from "./modules/commerce/payment/payment.controller.js"
import invoiceRouter from "./modules/commerce/invoice/invoice.controller.js"
import deliveryRouter from "./modules/commerce/delivery/delivery.controller.js"
import returnRouter from "./modules/commerce/return/return.controller.js"
import reviewRouter from "./modules/commerce/review/review.controller.js"
import cartRouter from "./modules/commerce/cart/cart.controller.js"
import wishlistRouter from "./modules/commerce/wishlist/wishlist.controller.js"

// admin
import auditLogRouter from "./modules/admin/auditLog/auditLog.controller.js"
import exchangeRateRouter from "./modules/admin/exchangeRate/exchangeRate.controller.js"

// engagement
import notificationRouter from "./modules/engagement/notification/notification.controller.js"

// marketing
import couponRouter from "./modules/marketing/coupon/coupon.controller.js"
import promotionRouter from "./modules/marketing/promotion/promotion.controller.js"

const app = express()
const port = PORT


const bootstrap = async ()=>{
    
    const limiter = rateLimit(
        {
            // NOTE: this limiter runs globally on every request (see app.use
            // below), including all the dashboard list/browse calls
            // (categories, products, variants, images, inventory, orders...).
            // A single admin screen alone can fire 10-20 GET requests, so the
            // old 50-requests-per-30-minutes budget was exhausted almost
            // immediately by normal navigation, not abuse. Widened the
            // window/limit to something that still throttles genuine abuse
            // (e.g. brute-forcing /auth/*) without blocking normal use.
            windowMs:15 * 60 * 1000,
            limit:1000,
            message:"You have exceeded the allowed number of requests. Please try again after a while.",
            requestPropertyName: "rate_limit",
            handler:(req , res ,next)=>
            {
                return successResponse({res , status:409 , message:"Requests limit reached. Try again later."})
            },
            skipFailedRequests:true,
            legacyHeaders:false
        }
    )
    

    const corsOptions = {
    origin: function (origin, callback) {
            if([...WHITLIST , undefined].includes(origin))
            {
                callback(null , true)
            }
            else
            {
                callback(new Error("not allow by cors"))
            }
    }
}

    app.use(
    cors(corsOptions),
    helmet(),
    compression(),
    limiter,
    express.json())

    checkConnectionDB()
    redisConnecition()

    app.use("/uploads" , express.static("uploads"))

app.get("/" , (req , res , next)=>
{
    console.log(req.rate_limit);
    
    successResponse({res , status:200 , message:`welcome on my app ....❤️`})
})

// customer-facing authentication API (Registered Customer / Business Customer)
app.use("/auth/user" , userAuthRouter)
// staff-facing authentication API (Owner, Admin, Sales, Inventory, Delivery, Accountant, Market Analyst)
app.use("/auth/admin" , staffAuthRouter)

// catalog
app.use("/catalog/categories" , categoryRouter)
app.use("/catalog/products" , productRouter)
app.use("/catalog/variants" , productVariantRouter)
app.use("/catalog/specification-definitions" , specificationDefinitionRouter)
app.use("/catalog/specification-values" , specificationValueRouter)
app.use("/catalog/images" , productImageRouter)
app.use("/catalog/inventory" , inventoryRouter)

// commerce
app.use("/commerce/orders" , orderRouter)
app.use("/commerce/payments" , paymentRouter)
app.use("/commerce/invoices" , invoiceRouter)
app.use("/commerce/delivery" , deliveryRouter)
app.use("/commerce/returns" , returnRouter)
app.use("/commerce/reviews" , reviewRouter)
app.use("/commerce/cart" , cartRouter)
app.use("/commerce/wishlist" , wishlistRouter)

// admin
app.use("/admin/audit-logs" , auditLogRouter)
app.use("/admin/exchange-rate" , exchangeRateRouter)

// engagement
app.use("/engagement/notifications" , notificationRouter)

// marketing
app.use("/marketing/coupons" , couponRouter)
app.use("/marketing/promotions" , promotionRouter)


app.use('{/*demo}' , (req , res , next)=>
{

    throw new Error(`Url${req.originalUrl} NOT FOUND` , {cause:404});
})
app.use((err , req , res , next)=>{
    res.status(err.cause || 500).json({message : err.message , stack : err.stack})
})
app.listen(port , ()=>
{
    console.log(`the server is runnig on port ${port}....❤️ 📌`)

})
}

export default bootstrap