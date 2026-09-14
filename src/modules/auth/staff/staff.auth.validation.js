import joi from "joi"
import { staffRoleEnum } from "../../../common/enum/auth.enum.js"
import { GeneralRules } from "../../../common/utils/generalRuels.js"

// Section 5 (Actors and Roles) + FR-ADMIN-01 (Owner has full access, which
// includes provisioning the other staff roles listed in the SRS).
export const createStaffSchema = {
    body:joi.object(
    {
        firstName:GeneralRules.firstName.required(),
        lastName:GeneralRules.lastName.required(),
        email:GeneralRules.email.required(),
        password:GeneralRules.password.required(),
        cPassword:GeneralRules.cPassword.required(),
        role:joi.string().valid(...Object.values(staffRoleEnum)).required(),
    }).required(),
}

// FR-AUTH-04
export const signInSchema =
{
    body:joi.object(
    {
        email:GeneralRules.email.required(),
        password:GeneralRules.password.required(),
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
