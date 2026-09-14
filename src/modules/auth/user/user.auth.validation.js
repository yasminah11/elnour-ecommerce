import joi from "joi"
import { customerTypeEnum } from "../../../common/enum/auth.enum.js"
import { GeneralRules } from "../../../common/utils/generalRuels.js"

// FR-AUTH-03: name, email, phone number, address data, and billing information.
// FR-AUTH-05: business/company information where applicable.
export const signUpSchema = {
    body:joi.object(
    {
        firstName:GeneralRules.firstName.required(),
        lastName:GeneralRules.lastName.required(),
        email:GeneralRules.email.required(),
        password:GeneralRules.password.required(),
        cPassword:GeneralRules.cPassword.required(),
        phone:GeneralRules.phone.required(),

        address:joi.object({
            city:GeneralRules.city.required(),
            details:GeneralRules.addressDetails.required(),
        }).required(),

        billingInfo:joi.object({
            billingName:joi.string().required(),
            billingAddress:joi.string().required(),
        }).required(),

        customerType:joi.string().valid(customerTypeEnum.registered , customerTypeEnum.business),

        businessInfo:joi.object({
            companyName:joi.string().required(),
            companyBillingInfo:joi.string().required(),
        }).when("customerType" , {
            is:customerTypeEnum.business,
            then:joi.required(),
            otherwise:joi.forbidden()
        }),

    }).required(),
}


// Sign in with Google: the front-end sends the Google ID token it received
// from Google Identity Services, the back-end verifies it server-side.
export const googleSignInSchema =
{
    body:joi.object(
    {
        idToken:joi.string().required(),
    }).required(),
}

export const signInSchema =
{
    body:joi.object(
    {
        email:GeneralRules.email.required(),
        password:GeneralRules.password.required(),
    }).required(),
}

export const updateProfileSchema =
{
    body:joi.object(
    {
        firstName:GeneralRules.firstName,
        lastName:GeneralRules.lastName,
        phone:GeneralRules.phone,
        billingInfo:joi.object({
            billingName:joi.string(),
            billingAddress:joi.string(),
        }),
        businessInfo:joi.object({
            companyName:joi.string(),
            companyBillingInfo:joi.string(),
        }),
    }).required(),
}

export const updatePasswordSchema =
{
    body:joi.object(
    {
        oldPassword:GeneralRules.password.required(),
        newPassword:GeneralRules.password.required(),
        cPassword:joi.string().valid(joi.ref("newPassword")).required(),
    }).required(),
}

export const ConfirmeEmailSchema =
{
    body:joi.object(
        {
            email:GeneralRules.email.required(),
            code:joi.string().length(6).required()
        }
    ).required()
}

export const resendOtpSchema =
{
    body:joi.object(
        {
            email:GeneralRules.email.required(),
        }
    ).required()
}

export const forgetPasswordSchema =
{
    body:joi.object(
        {
            email:GeneralRules.email.required(),
        }
    ).required()
}

export const resetPasswordSchema =
{
    body:joi.object(
        {
            email:GeneralRules.email.required(),
            password:GeneralRules.password.required(),
            cPassword: joi.string().valid(joi.ref("password")).required(),
            code:joi.string().length(6).required()
        }
    ).required()
}

// FR-AUTH-06: saved addresses
export const addAddressSchema =
{
    body:joi.object(
        {
            city:GeneralRules.city.required(),
            details:GeneralRules.addressDetails.required(),
            isDefault:joi.boolean()
        }
    ).required()
}

export const updateAddressSchema =
{
    params:joi.object(
        {
            addressId:GeneralRules.authId.required()
        }
    ).required(),
    body:joi.object(
        {
            city:GeneralRules.city,
            details:GeneralRules.addressDetails,
            isDefault:joi.boolean()
        }
    ).required()
}

export const deleteAddressSchema =
{
    params:joi.object(
        {
            addressId:GeneralRules.authId.required()
        }
    ).required()
}
