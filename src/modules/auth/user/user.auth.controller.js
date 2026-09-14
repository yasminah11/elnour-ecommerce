import { Router } from "express";
import * as US from "./user.auth.service.js"
import * as UV from "./user.auth.validation.js"
import { authentication } from "../../../common/middleware/auth.js";
import { accountTypeEnum } from "../../../common/enum/auth.enum.js";
import validation from "../../../common/middleware/validation.js";

const userAuthRouter = Router({ caseSensitive: true, strict: true })

const authenticateUser = authentication({ accountType: accountTypeEnum.user })

// FR-AUTH-03 / FR-AUTH-05
userAuthRouter.post("/sign-up", validation(UV.signUpSchema), US.signUp)
userAuthRouter.patch("/confirm-email", validation(UV.ConfirmeEmailSchema), US.confirmeEmail)
userAuthRouter.post("/resend-otp", validation(UV.resendOtpSchema), US.resendOtp)

// FR-AUTH-04
userAuthRouter.post("/sign-in", validation(UV.signInSchema), US.signIn)
// Sign in with Google (OAuth) — verifies the Google ID token, finds/creates
// the account, and returns the same access/refresh token pair as /sign-in
userAuthRouter.post("/google", validation(UV.googleSignInSchema), US.googleSignIn)
userAuthRouter.get("/refresh-token", US.refresh_token)
userAuthRouter.post("/logout", authenticateUser, US.logout)
userAuthRouter.patch("/forget-password", validation(UV.forgetPasswordSchema), US.forgetPassword)
userAuthRouter.patch("/reset-password", validation(UV.resetPasswordSchema), US.resetPassword)
userAuthRouter.patch("/update-password", authenticateUser, validation(UV.updatePasswordSchema), US.update_Password)

// FR-AUTH-03 (account maintenance)
userAuthRouter.get("/profile", authenticateUser, US.getProfile)
userAuthRouter.patch("/profile", authenticateUser, validation(UV.updateProfileSchema), US.update_Profile)

// FR-AUTH-06
userAuthRouter.post("/address", authenticateUser, validation(UV.addAddressSchema), US.addAddress)
userAuthRouter.patch("/address/:addressId", authenticateUser, validation(UV.updateAddressSchema), US.updateAddress)
userAuthRouter.delete("/address/:addressId", authenticateUser, validation(UV.deleteAddressSchema), US.deleteAddress)

export default userAuthRouter
