import mongoose from "mongoose";
import { staffRoleEnum } from "../../common/enum/auth.enum.js";

// Section 5 (Actors and Roles): Owner, Admin, Sales Employee, Inventory Employee,
// Delivery Employee, Accountant, Market Analyst.
// Section 14 (Initial Domain Entities): "Staff User / Role / Permission"
const staffSchema = new mongoose.Schema(
    {
        firstName:
        {
            type:String,
            required:true,
            trim:true,
            minLength:2,
            maxLength:20
        },
        lastName:
        {
            type:String,
            required:true,
            trim:true,
            minLength:2,
            maxLength:20
        },
        email:
        {
            type:String,
            required:true,
            unique:true,
            trim:true,
        },
        password:
        {
            type:String,
            required:true,
            trim:true,
            minLength:7,
        },

        role:{
            type:String,
            enum:Object.values(staffRoleEnum),
            required:true
        },

        changeCredential:Date,
    },
    {
        timestamps:true,
        strictQuery:true,
        toJSON:{virtuals:true},
    }
)

staffSchema.virtual("fullName")
.get(function()
{
    return this.firstName + " " + this.lastName
})

const staffModel = mongoose.models.staff || mongoose.model("staff" , staffSchema)
staffModel.syncIndexes().catch((err)=>console.error("syncIndexes error:", err.message))
export default staffModel
