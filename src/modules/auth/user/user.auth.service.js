import { accountTypeEnum, customerTypeEnum, authProviderEnum } from "../../../common/enum/auth.enum.js";
import { bcryptPssword, comparePssword } from "../../../common/utils/security/hash.security.js";
import successResponse from "../../../common/utils/successes_response/succsses.response.js";
import * as db_service from "../../../DB/db.service.js"
import authModel from "../../../DB/models/auth.model.js"
import { randomUUID } from "crypto";
import { OAuth2Client } from "google-auth-library";
import { generateToken, verifyToken } from "../../../common/utils/token/token.service.js";
import { ACCESS_SEUCRIT_KEY, PERFIX, REFRESH_SEUCRIT_KEY, GOOGLE_CLIENT_ID } from "../../../../config/config.service.js";
import { block_otp_key, deleteKey, get, get_keys, incr, keys, max_otp_key, otp_key, revoke_key, set, ttl } from "../../../DB/redis/redis.service.js";
import { genrateOtp, sendEmail } from "../../../common/utils/email/send.email.js";
import { eventEmitter } from "../../../common/utils/email/email.events.js";
import { emailTempalet } from "../../../common/utils/email/email.template.js";
import { emailEnum } from "../../../common/enum/email.enum.js";

// namespaced subject so the customer OTP flow never collides with the staff one
const userSubject = (subject) => `${subject}::${accountTypeEnum.user}`

const sendEmailOtp = async ({ email, subject } = {}) => {
    const isblocked = await ttl({ key: block_otp_key({ email }) })
    if (isblocked > 0) {
        throw new Error(`Too many attempts. Try again after ${isblocked} seconds.`, { cause: 401 });
    }

    const otpTTl = await ttl({ key: otp_key({ email, subject }) })
    if (otpTTl > 0) {
        throw new Error(`you can resend otp after ${otpTTl} seconds`);
    }

    const maxOtp = await get({ key: max_otp_key({ email, subject }) })
    if (maxOtp >= 3) {
        await set({ key: block_otp_key({ email }), value: 1, ttl: 60 })
        throw new Error(`you have exceeded the max number of tries`);
    }

    const otp = await genrateOtp()
    eventEmitter.emit(emailEnum.confirmeEmail, async () => {
        await sendEmail({
            to: email,
            subject: "Confirm your El-Nour Technology account",
            html: emailTempalet(otp)
        })

        await set({
            key: otp_key({ email, subject }),
            value: bcryptPssword({ textPlan: `${otp}` }),
            ttl: 60 * 2
        })

        await incr({ key: max_otp_key({ email, subject }) })
    })
}

// FR-AUTH-03 / FR-AUTH-05
export const signUp = async (req, res, next) => {
    const { firstName, lastName, email, password, cPassword, phone, address, billingInfo, customerType, businessInfo } = req.body

    if (password !== cPassword) {
        throw new Error("password is not valid")
    }

    if (await db_service.findOne({ model: authModel, check: { email } })) {
        throw new Error("Email already exist", { cause: 409 })
    }

    const auth = await db_service.create({
        model: authModel,
        dataa: {
            firstName,
            lastName,
            email,
            password: bcryptPssword({ textPlan: password }),
            phone,
            addresses: [{ ...address, isDefault: true }],
            billingInfo,
            customerType: customerType || customerTypeEnum.registered,
            businessInfo: customerType === customerTypeEnum.business ? businessInfo : undefined
        }
    })

    await sendEmailOtp({ email, subject: userSubject(emailEnum.confirmeEmail) })

    successResponse({ res, message: "account created, please confirm your email", data: auth })
}

export const confirmeEmail = async (req, res, next) => {
    const { email, code } = req.body
    const otpValue = await get({ key: otp_key({ email, subject: userSubject(emailEnum.confirmeEmail) }) })
    if (!otpValue) {
        throw new Error("otp Expired", { cause: 404 });
    }

    if (!comparePssword({ textPlan: code, cipertext: otpValue })) {
        throw new Error("inValid otp");
    }

    const auth = await db_service.findOneAndUpdate({
        model: authModel,
        check: { email, confirmed: false },
        update: { confirmed: true }
    })
    if (!auth) {
        throw new Error("auth not exisit");
    }
    await deleteKey({ key: otp_key({ email, subject: userSubject(emailEnum.confirmeEmail) }) })
    successResponse({ res, message: "email confirmed successfully" })
}

export const resendOtp = async (req, res, next) => {
    const { email } = req.body

    const auth = await db_service.findOne({
        model: authModel,
        check: { email, confirmed: false }
    })
    if (!auth) {
        throw new Error("auth not exist or already confirmed", { cause: 409 });
    }

    await sendEmailOtp({ email, subject: userSubject(emailEnum.confirmeEmail) })

    successResponse({ res, message: "otp sent successfully" })
}

// FR-AUTH-04
export const signIn = async (req, res, next) => {
    const { email, password } = req.body
    const auth = await db_service.findOne({ model: authModel, check: { email, confirmed: true } })
    if (!auth) {
        throw new Error("Email does not exist or is not confirmed", { cause: 403 });
    }

    // Accounts created via "Sign in with Google" have no local password
    // (see googleSignIn below) — comparePssword/bcrypt would otherwise throw
    // a raw "data and hash arguments required" and crash to a 500 instead of
    // a clear, actionable error.
    if (!auth.password) {
        throw new Error("This account uses Google sign-in. Please continue with Google instead of a password.", { cause: 400 });
    }

    if (!comparePssword({ textPlan: password, cipertext: auth.password })) {
        throw new Error("InValid Password", { cause: 409 });
    }

    const jwtid = randomUUID()
    const access_token = generateToken({
        paylod: { authId: auth._id, accountType: accountTypeEnum.user },
        seucrit: ACCESS_SEUCRIT_KEY,
        options: {
            expiresIn: "1y",
            issuer: "http://localhost:3001",
            audience: "http://localhost:4000",
            jwtid
        }
    })

    const refresh_token = generateToken({
        paylod: { authId: auth._id, accountType: accountTypeEnum.user },
        seucrit: REFRESH_SEUCRIT_KEY,
        options: {
            expiresIn: "1y",
            jwtid
        }
    })
    successResponse({ res, data: { access_token, refresh_token } })
}

// Sign in with Google (OAuth): verifies the Google ID token server-side,
// finds/creates the matching customer account, then issues the same
// access/refresh token pair as a normal sign-in.
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)

export const googleSignIn = async (req, res, next) => {
    const { idToken } = req.body

    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload()

    if (!payload?.email || !payload?.email_verified) {
        throw new Error("Google account email is not verified", { cause: 403 });
    }

    let auth = await db_service.findOne({ model: authModel, check: { email: payload.email } })

    if (!auth) {
        auth = await db_service.create({
            model: authModel,
            dataa: {
                firstName: payload.given_name || "Google",
                lastName: payload.family_name || "User",
                email: payload.email,
                googleId: payload.sub,
                authProvider: authProviderEnum.google,
                customerType: customerTypeEnum.registered,
                confirmed: true
            }
        })
    } else if (!auth.googleId) {
        // an existing local account is signing in with the same email via Google:
        // link the Google identity so future Google sign-ins resolve to it,
        // without touching the existing password/local flow.
        auth.googleId = payload.sub
        if (!auth.confirmed) auth.confirmed = true
        await auth.save()
    }

    const jwtid = randomUUID()
    const access_token = generateToken({
        paylod: { authId: auth._id, accountType: accountTypeEnum.user },
        seucrit: ACCESS_SEUCRIT_KEY,
        options: {
            expiresIn: "1y",
            issuer: "http://localhost:3001",
            audience: "http://localhost:4000",
            jwtid
        }
    })

    const refresh_token = generateToken({
        paylod: { authId: auth._id, accountType: accountTypeEnum.user },
        seucrit: REFRESH_SEUCRIT_KEY,
        options: {
            expiresIn: "1y",
            jwtid
        }
    })

    successResponse({ res, data: { access_token, refresh_token } })
}

export const getProfile = async (req, res, next) => {
    const key = `profile::${accountTypeEnum.user}::${req.auth._id}`;
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
    if (!decoded || !decoded?.authId || decoded.accountType !== accountTypeEnum.user) {
        throw new Error("inValid Token");
    }

    const auth = await db_service.findOne({ model: authModel, check: { _id: decoded.authId }, select: "-password" })
    if (!auth) {
        throw new Error("auth NOT FOUND", { cause: 404 });
    }

    const access_token = generateToken({
        paylod: { authId: auth._id, accountType: accountTypeEnum.user },
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

// FR-AUTH-03
export const update_Profile = async (req, res, next) => {
    let { firstName, lastName, phone, billingInfo, businessInfo } = req.body

    const auth = await db_service.findOneAndUpdate({
        model: authModel,
        check: { _id: req.auth._id },
        update: { firstName, lastName, phone, billingInfo, businessInfo }
    })

    if (!auth) {
        throw new Error("auth not found", { cause: 404 });
    }
    await deleteKey({ key: `profile::${accountTypeEnum.user}::${req.auth._id}` })
    successResponse({ res, data: auth })
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
    const auth = await db_service.findOne({ model: authModel, check: { email, confirmed: true } })
    if (!auth) {
        throw new Error("Email does not exist or is not confirmed", { cause: 403 });
    }

    await sendEmailOtp({ email, subject: userSubject(emailEnum.forgetPassword) })
    successResponse({ res, message: "otp sent successfully" })
}

export const resetPassword = async (req, res, next) => {
    const { email, code, password } = req.body

    const otpValue = await get({ key: otp_key({ email, subject: userSubject(emailEnum.forgetPassword) }) })
    if (!otpValue) {
        throw new Error("otp expired");
    }

    if (!comparePssword({ textPlan: code, cipertext: otpValue })) {
        throw new Error("inValid otp");
    }

    const auth = await db_service.findOneAndUpdate({
        model: authModel,
        check: { email, confirmed: true },
        update: {
            password: bcryptPssword({ textPlan: password }),
            changeCredential: new Date()
        }
    })
    if (!auth) {
        throw new Error("Email does not exist or is not confirmed", { cause: 403 });
    }

    await deleteKey({ key: otp_key({ email, subject: userSubject(emailEnum.forgetPassword) }) })
    successResponse({ res, message: "password updated" })
}

// FR-AUTH-06: saved addresses
export const addAddress = async (req, res, next) => {
    const { city, details, isDefault } = req.body

    if (isDefault) {
        await db_service.findOneAndUpdate({
            model: authModel,
            check: { _id: req.auth._id },
            update: { $set: { "addresses.$[].isDefault": false } }
        })
    }

    const auth = await db_service.findOneAndUpdate({
        model: authModel,
        check: { _id: req.auth._id },
        update: { $push: { addresses: { city, details, isDefault: !!isDefault } } }
    })

    if (!auth) {
        throw new Error("auth not found", { cause: 404 });
    }
    await deleteKey({ key: `profile::${accountTypeEnum.user}::${req.auth._id}` })
    successResponse({ res, message: "address added" })
}

export const updateAddress = async (req, res, next) => {
    const { addressId } = req.params
    const { city, details, isDefault } = req.body

    if (isDefault) {
        await db_service.findOneAndUpdate({
            model: authModel,
            check: { _id: req.auth._id },
            update: { $set: { "addresses.$[].isDefault": false } }
        })
    }

    const update = {}
    if (city) update["addresses.$.city"] = city
    if (details) update["addresses.$.details"] = details
    if (isDefault !== undefined) update["addresses.$.isDefault"] = isDefault

    const auth = await db_service.findOneAndUpdate({
        model: authModel,
        check: { _id: req.auth._id, "addresses._id": addressId },
        update: { $set: update }
    })

    if (!auth) {
        throw new Error("address not found", { cause: 404 });
    }
    await deleteKey({ key: `profile::${accountTypeEnum.user}::${req.auth._id}` })
    successResponse({ res, message: "address updated" })
}

export const deleteAddress = async (req, res, next) => {
    const { addressId } = req.params

    const auth = await db_service.findOneAndUpdate({
        model: authModel,
        check: { _id: req.auth._id },
        update: { $pull: { addresses: { _id: addressId } } }
    })

    if (!auth) {
        throw new Error("auth not found", { cause: 404 });
    }
    await deleteKey({ key: `profile::${accountTypeEnum.user}::${req.auth._id}` })
    successResponse({ res, message: "address deleted" })
}