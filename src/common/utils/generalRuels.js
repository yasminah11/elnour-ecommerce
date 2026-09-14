import joi from "joi"
import { Types } from "mongoose"


export const GeneralRules = {
            firstName:joi.string().min(2).max(20),
            lastName:joi.string().min(2).max(20),
            phone:joi.string().pattern(new RegExp(/^[0-9]{11}$/)),
            email:joi.string().email({tlds:{allow:['com' , 'net']}}),
            password:joi.string().pattern(new RegExp(/^[a-z]{5}[0-9]{7}$/)),
            cPassword:joi.string().valid(joi.ref("password")),
            city:joi.string().min(2).max(50),
            addressDetails:joi.string().min(2).max(200),
            authId: joi.string().custom((value , helper)=>{
                const isValid = Types.ObjectId.isValid(value)
                return isValid ? value : helper.message("inViled userId")
            }),
            // generic Mongo ObjectId validator, used across catalog/commerce/
            // marketing schemas (category, product, variant, order ids, etc.)
            objectId: joi.string().custom((value , helper)=>{
                const isValid = Types.ObjectId.isValid(value)
                return isValid ? value : helper.message("inValid objectId")
            }),
            // pagination, used by sharedSchemas.listQuerySchema. Some
            // admin screens (e.g. category pickers) pull up to 200 rows in
            // one page to populate a dropdown, so allow generous limits.
            page: joi.number().integer().min(1),
            limit: joi.number().integer().min(1).max(500),
            
                file: joi.object({
                fieldname: joi.string().required(),
                originalname: joi.string().required(),
                encoding: joi.string().required(),
                mimetype: joi.string().required(),
                destination: joi.string().required(),
                filename: joi.string().required(),
                path: joi.string().required(),
                size: joi.number().required(),
                }).required().messages({"any.required":"file is required"}),

                
}