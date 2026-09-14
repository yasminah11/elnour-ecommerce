import paymentRecordModel from "../../../DB/models/paymentRecord.model.js"
import orderModel from "../../../DB/models/order.model.js"
import * as db_service from "../../../DB/db.service.js"
import successResponse from "../../../common/utils/successes_response/succsses.response.js"
import { paymentStatusEnum } from "../../../common/enum/payment.enum.js"
import { orderStatusEnum } from "../../../common/enum/order.enum.js"
import { writeAudit } from "../../../common/utils/audit.util.js"
import { actorModelEnum } from "../../../common/enum/audit.enum.js"

// FR-PAY-02: payment status kept separate from order status, but marking a
// COD/pickup payment "paid" is what advances the order to paymentConfirmed.
export const updateStatus = async (req, res, next) => {
    const { id } = req.params
    const { status } = req.body

    const record = await db_service.findById({ model: paymentRecordModel, id })
    if (!record) throw new Error("payment record NOT FOUND", { cause: 404 })

    record.status = status
    if (status === paymentStatusEnum.paid) record.paidAt = new Date()
    record.recordedBy = req.auth._id
    await record.save()

    if (status === paymentStatusEnum.paid) {
        await orderModel.findOneAndUpdate(
            { _id: record.order, status: orderStatusEnum.pendingPayment },
            { status: orderStatusEnum.paymentConfirmed }
        )
    }

    await writeAudit({
        actor: req.auth._id,
        actorModel: actorModelEnum.staff,
        action: "payment.statusChange",
        targetType: "paymentRecord",
        targetId: record._id,
        metadata: { status }
    })

    successResponse({ res, message: "payment record updated", data: record })
}
