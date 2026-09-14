import deliveryModel from "../../../DB/models/delivery.model.js"
import orderModel from "../../../DB/models/order.model.js"
import orderStatusHistoryModel from "../../../DB/models/orderStatusHistory.model.js"
import * as db_service from "../../../DB/db.service.js"
import successResponse from "../../../common/utils/successes_response/succsses.response.js"
import { deliveryTrackingStatusEnum } from "../../../common/enum/delivery.enum.js"
import { orderStatusEnum } from "../../../common/enum/order.enum.js"
import { actorModelEnum } from "../../../common/enum/audit.enum.js"
import { writeAudit } from "../../../common/utils/audit.util.js"

// FR-DEL-07: keep the order's own status roughly aligned with delivery
// tracking, so a customer following FR-FLOW status sees the update too.
const trackingToOrderStatus = {
    [deliveryTrackingStatusEnum.preparing]: orderStatusEnum.preparing,
    [deliveryTrackingStatusEnum.shipped]: orderStatusEnum.shipped,
    [deliveryTrackingStatusEnum.outForDelivery]: orderStatusEnum.outForDelivery,
    [deliveryTrackingStatusEnum.delivered]: orderStatusEnum.delivered
}

// FR-DEL-06: courier API is deferred, a Delivery employee updates status
// (and records exceptions) manually in this release.
export const updateTracking = async (req, res, next) => {
    const { id } = req.params
    const { trackingStatus, exceptionNote } = req.body

    const delivery = await db_service.findById({ model: deliveryModel, id })
    if (!delivery) throw new Error("delivery NOT FOUND", { cause: 404 })

    delivery.trackingStatus = trackingStatus
    delivery.exceptionNote = exceptionNote || null
    delivery.assignedEmployee = delivery.assignedEmployee || req.auth._id
    await delivery.save()

    const mappedOrderStatus = trackingToOrderStatus[trackingStatus]
    if (mappedOrderStatus) {
        const order = await db_service.findById({ model: orderModel, id: delivery.order })
        if (order && order.status !== mappedOrderStatus) {
            const oldStatus = order.status
            order.status = mappedOrderStatus
            await order.save()
            await db_service.create({
                model: orderStatusHistoryModel,
                dataa: {
                    order: order._id,
                    actor: req.auth._id,
                    actorModel: actorModelEnum.staff,
                    oldStatus,
                    newStatus: mappedOrderStatus,
                    reason: `delivery tracking updated to ${trackingStatus}`
                }
            })
        }
    }

    await writeAudit({
        actor: req.auth._id,
        actorModel: actorModelEnum.staff,
        action: "delivery.trackingUpdate",
        targetType: "delivery",
        targetId: delivery._id,
        metadata: { trackingStatus, exceptionNote }
    })

    successResponse({ res, message: "delivery tracking updated", data: delivery })
}

export const myDelivery = async (req, res, next) => {
    const { orderId } = req.params
    const order = await db_service.findOne({ model: orderModel, check: { _id: orderId, user: req.auth._id } })
    if (!order) throw new Error("order NOT FOUND", { cause: 404 })
    const delivery = await db_service.findOne({ model: deliveryModel, check: { order: order._id } })
    if (!delivery) throw new Error("delivery NOT FOUND", { cause: 404 })
    successResponse({ res, data: delivery })
}
