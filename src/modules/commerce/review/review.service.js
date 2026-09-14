import reviewModel from "../../../DB/models/review.model.js"
import orderItemModel from "../../../DB/models/orderItem.model.js"
import orderModel from "../../../DB/models/order.model.js"
import * as db_service from "../../../DB/db.service.js"
import successResponse from "../../../common/utils/successes_response/succsses.response.js"
import { orderStatusEnum } from "../../../common/enum/order.enum.js"

// FR-REV-01/02/03: only a customer who purchased the item, on a delivered
// order, may review it — validated server-side rather than trusted from the
// client.
export const createReview = async (req, res, next) => {
    const { orderItem: orderItemId, rating, comment } = req.body

    const orderItem = await db_service.findById({ model: orderItemModel, id: orderItemId })
    if (!orderItem) throw new Error("order item NOT FOUND", { cause: 404 })

    const order = await db_service.findOne({ model: orderModel, check: { _id: orderItem.order, user: req.auth._id } })
    if (!order) throw new Error("you can only review items from your own orders", { cause: 403 })
    if (order.status !== orderStatusEnum.delivered) {
        throw new Error("you can only review items from delivered orders", { cause: 409 })
    }

    if (await db_service.findOne({ model: reviewModel, check: { user: req.auth._id, orderItem: orderItem._id } })) {
        throw new Error("you already reviewed this purchase", { cause: 409 })
    }

    const review = await db_service.create({
        model: reviewModel,
        dataa: { user: req.auth._id, variant: orderItem.variant, orderItem: orderItem._id, rating, comment }
    })

    successResponse({ res, status: 201, message: "review submitted", data: review })
}
