import mongoose from "mongoose";
import { deliveryTrackingStatusEnum } from "../../common/enum/delivery.enum.js";

// FR-DEL-03/04, TBD-04/TBD-05: delivery fee depends on order value and
// distance, but the exact formula and distance source are TBD — this schema
// stores the resolved fee/distance as data, it does not encode the formula.
// FR-DEL-05: delivery address is chosen from the customer's saved addresses,
// which live as a subdocument array on the auth model (addresses[]); since
// that subdocument isn't a standalone queryable collection, the address is
// captured here as a snapshot for historical integrity (NFR-DATA-03),
// alongside the source subdocument id for traceability.
const deliverySchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "order",
            required: true,
            unique: true
        },

        addressSnapshot: {
            city: { type: String, required: true, trim: true },
            details: { type: String, required: true, trim: true }
        },
        // Id of the subdocument inside auth.addresses this was copied from
        // (not a populatable ref, just a traceability pointer).
        sourceAddressId: { type: mongoose.Schema.Types.ObjectId, default: null },

        // TBD-05: distance source not decided; null until available.
        distanceKm: { type: Number, default: null, min: 0 },
        // TBD-04: formula not decided; the resolved fee amount only.
        deliveryFee: { type: Number, required: true, min: 0, default: 0 },

        trackingStatus: {
            type: String,
            enum: Object.values(deliveryTrackingStatusEnum),
            default: deliveryTrackingStatusEnum.preparing
        },

        // FR-DEL-06: courier API deferred — a Delivery employee updates
        // status/exceptions manually in this release.
        assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: "staff", default: null },
        exceptionNote: { type: String, trim: true, default: null }
    },
    {
        timestamps: true,
        strictQuery: true
    }
)

const deliveryModel = mongoose.models.delivery || mongoose.model("delivery", deliverySchema)
export default deliveryModel
