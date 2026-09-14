import { accountTypeEnum } from "../../../common/enum/auth.enum.js";
import { bcryptPssword, comparePssword } from "../../../common/utils/security/hash.security.js";
import successResponse from "../../../common/utils/successes_response/succsses.response.js";
import * as db_service from "../../../DB/db.service.js"
import staffModel from "../../../DB/models/staff.model.js"
import { randomUUID } from "crypto";
import { generateToken, verifyToken } from "../../../common/utils/token/token.service.js";
import { ACCESS_SEUCRIT_KEY, PERFIX, REFRESH_SEUCRIT_KEY } from "../../../../config/config.service.js";
import { deleteKey, get, get_keys, keys, otp_key, revoke_key, set, ttl, block_otp_key, max_otp_key, incr } from "../../../DB/redis/redis.service.js";
import { genrateOtp, sendEmail } from "../../../common/utils/email/send.email.js";
import { eventEmitter } from "../../../common/utils/email/email.events.js";
import { emailTempalet } from "../../../common/utils/email/email.template.js";
import { emailEnum } from "../../../common/enum/email.enum.js";

// namespaced subject so the staff OTP flow never collides with the customer one
const staffSubject = (subject) => `${subject}::${accountTypeEnum.staff}`

// FR-ADMIN-01: Owner has full access -> Owner provisions the other staff
// roles listed in Section 5 (Actors and Roles). Staff accounts are created
// internally by the Owner, there is no public self sign-up for staff.
export const createStaff = async (req, res, next) => {
    const { firstName, lastName, email, password, cPassword, role } = req.body

    if (password !== cPassword) {
        throw new Error("password is not valid")
    }

    if (await db_service.findOne({ model: staffModel, check: { email } })) {
        throw new Error("Email already exist", { cause: 409 })
    }

    const staff = await db_service.create({
        model: staffModel,
        dataa: {
            firstName,
            lastName,
            email,
            password: bcryptPssword({ textPlan: password }),
            role
        }
    })

    successResponse({ res, message: "staff account created", data: staff })
}

// FR-AUTH-04
export const signIn = async (req, res, next) => {
    const { email, password } = req.body
    const auth = await db_service.findOne({ model: staffModel, check: { email } })
    if (!auth) {
        throw new Error("Email does not exist", { cause: 403 });
    }

    // Defensive: a staff record should always have a password, but guard
    // against a corrupted/incomplete record crashing bcrypt with a raw
    // "data and hash arguments required" 500 instead of a clear error.
    if (!auth.password) {
        throw new Error("This account has no password set. Contact the owner/admin.", { cause: 400 });
    }

    if (!comparePssword({ textPlan: password, cipertext: auth.password })) {
        throw new Error("InValid Password", { cause: 409 });
    }


    const jwtid = randomUUID()
    const access_token = generateToken({
        paylod: { authId: auth._id, accountType: accountTypeEnum.staff },
        seucrit: ACCESS_SEUCRIT_KEY,
        options: {
            expiresIn: "1y",
            issuer: "http://localhost:3001",
            audience: "http://localhost:4000",
            jwtid
        }
    })

    const refresh_token = generateToken({
        paylod: { authId: auth._id, accountType: accountTypeEnum.staff },
        seucrit: REFRESH_SEUCRIT_KEY,
        options: {
            expiresIn: "1y",
            jwtid
        }
    })
    successResponse({ res, data: { access_token, refresh_token } })
}

export const getProfile = async (req, res, next) => {
    const key = `profile::${accountTypeEnum.staff}::${req.auth._id}`;
    const authExist = await get({ key });

    if (authExist) {
        return successResponse({ res, data: authExist });
    }

    await set({ key, value: req.auth, ttl: 60 * 5 });
    successResponse({ res, data: req.auth });
}

export const refresh_token = async (req, res, next) => {
    const { authentication } = req.headers

    if (!authentication) {
        throw new Error("token not exist", { cause: 403 });
    }

    const [perfix, token] = authentication.split(" ")
    if (perfix !== PERFIX) {
        throw new Error("inValid Token perfix");
    }

    const decoded = verifyToken({ token, seucrit: REFRESH_SEUCRIT_KEY })
    if (!decoded || !decoded?.authId || decoded.accountType !== accountTypeEnum.staff) {
        throw new Error("inValid Token");
    }

    const auth = await db_service.findOne({ model: staffModel, check: { _id: decoded.authId }, select: "-password" })
    if (!auth) {
        throw new Error("auth NOT FOUND", { cause: 404 });
    }

    const access_token = generateToken({
        paylod: { authId: auth._id, accountType: accountTypeEnum.staff },
        seucrit: ACCESS_SEUCRIT_KEY,
        options: {
            expiresIn: "1y",
            notBefore: 1,
            noTimestamp: true,
            issuer: "http://localhost:3001",
            audience: "http://localhost:4000",
            jwtid: randomUUID()
        }
    })
    successResponse({ res, data: { access_token } })
}

// FR-AUTH-04
export const update_Password = async (req, res, next) => {
    let { oldPassword, newPassword } = req.body
    if (!comparePssword({ textPlan: oldPassword, cipertext: req.auth.password })) {
        throw new Error("old password is not valid");
    }

    const hash = bcryptPssword({ textPlan: newPassword })
    req.auth.password = hash
    req.auth.changeCredential = new Date()
    await req.auth.save()
    successResponse({ res })
}

export const logout = async (req, res, next) => {
    const { flag } = req.query
    if (flag === "all") {
        req.auth.changeCredential = new Date()
        await req.auth.save()
        const authKeys = await keys({ pattern: get_keys({ authId: req.auth._id }) })
        await deleteKey({ key: authKeys })
    } else {
        await set({
            key: revoke_key({ authId: req.auth._id, jti: req.decoded.jti }),
            value: `${req.decoded.jti}`,
            ttl: req.decoded.exp - Math.floor(Date.now() / 1000)
        })
    }
    successResponse({ res })
}

export const forgetPassword = async (req, res, next) => {
    const { email } = req.body
    const auth = await db_service.findOne({ model: staffModel, check: { email } })
    if (!auth) {
        throw new Error("Email does not exist", { cause: 403 });
    }

    const subject = staffSubject(emailEnum.forgetPassword)

    const isblocked = await ttl({ key: block_otp_key({ email }) })
    if (isblocked > 0) {
        throw new Error(`Too many attempts. Try again after ${isblocked} seconds.`, { cause: 401 });
    }

    const otp = await genrateOtp()
    eventEmitter.emit(emailEnum.confirmeEmail, async () => {
        await sendEmail({
            to: email,
            subject: "Reset your El-Nour Technology staff password",
            html: emailTempalet(otp)
        })

        await set({
            key: otp_key({ email, subject }),
            value: bcryptPssword({ textPlan: `${otp}` }),
            ttl: 60 * 2
        })

        await incr({ key: max_otp_key({ email, subject }) })
    })

    successResponse({ res, message: "otp sent successfully" })
}

export const resetPassword = async (req, res, next) => {
    const { email, code, password } = req.body

    const otpValue = await get({ key: otp_key({ email, subject: staffSubject(emailEnum.forgetPassword) }) })
    if (!otpValue) {
        throw new Error("otp expired");
    }

    if (!comparePssword({ textPlan: code, cipertext: otpValue })) {
        throw new Error("inValid otp");
    }

    const auth = await db_service.findOneAndUpdate({
        model: staffModel,
        check: { email },
        update: {
            password: bcryptPssword({ textPlan: password }),
            changeCredential: new Date()
        }
    })
    if (!auth) {
        throw new Error("Email does not exist", { cause: 403 });
    }

    await deleteKey({ key: otp_key({ email, subject: staffSubject(emailEnum.forgetPassword) }) })
    successResponse({ res, message: "password updated" })
}