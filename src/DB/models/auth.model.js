import mongoose from "mongoose";
import { customerTypeEnum, authProviderEnum } from "../../common/enum/auth.enum.js";

// FR-AUTH-06: the system shall allow customers to maintain saved addresses.
const addressSchema = new mongoose.Schema(
    {
        city: { type: String, required: true, trim: true },
        details: { type: String, required: true, trim: true },
        isDefault: { type: Boolean, default: false }
    },
    { _id: true }
)

// FR-AUTH-03: the system shall create customer accounts containing at minimum
// name, email, phone number, address data, and billing information.
const authSchema = new mongoose.Schema(
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
            trim:true,
            minLength:7,
            // local sign-up always sets a password; a Google account created via
            // OAuth (authProvider "google") has no local password.
            required:function(){ return this.authProvider !== authProviderEnum.google }
        },
        phone:
        {
            type:String,
            required:function(){ return this.authProvider !== authProviderEnum.google }
        },

        // Google OAuth (Sign in with Google)
        googleId:{ type:String, unique:true, sparse:true },
        authProvider:{
            type:String,
            enum:Object.values(authProviderEnum),
            default:authProviderEnum.local
        },

        // FR-AUTH-06
        addresses:[addressSchema],

        // FR-AUTH-03: billing information
        billingInfo:{
            billingName:{ type:String, trim:true, required:function(){ return this.authProvider !== authProviderEnum.google } },
            billingAddress:{ type:String, trim:true, required:function(){ return this.authProvider !== authProviderEnum.google } }
        },

        // Section 5 (Actors and Roles): Registered Customer vs Business/Company Customer
        customerType:{
            type:String,
            enum:Object.values(customerTypeEnum),
            default:customerTypeEnum.registered
        },

        // FR-AUTH-05: the system shall support customer business/company information where applicable.
        businessInfo:{
            companyName:{
                type:String,
                trim:true,
                required:function(){ return this.customerType === customerTypeEnum.business }
            },
            companyBillingInfo:{
                type:String,
                trim:true,
                required:function(){ return this.customerType === customerTypeEnum.business }
            }
        },

        changeCredential:Date,
        confirmed:{ type:Boolean, default:false },

    },
    {
        timestamps:true,
        strictQuery:true,
        toJSON:{virtuals:true},
    }
)

authSchema.virtual("fullName")
.get(function()
{
    return this.firstName + " " + this.lastName
})
.set(function (v)
{
this.firstName = v.split(" ")[0]
this.lastName = v.split(" ")[1]
})


const authModel = mongoose.models.auth || mongoose.model("auth" , authSchema)
authModel.syncIndexes().catch((err)=>console.error("syncIndexes error:", err.message))
export default authModel
