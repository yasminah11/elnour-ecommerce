import { Router } from "express";
import * as SS from "./staff.auth.service.js"
import * as SV from "./staff.auth.validation.js"
import { authentication } from "../../../common/middleware/auth.js";
import { authorization } from "../../../common/middleware/authorization.js";
import { accountTypeEnum, staffRoleEnum } from "../../../common/enum/auth.enum.js";
import validation from "../../../common/middleware/validation.js";

const staffAuthRouter = Router({ caseSensitive: true, strict: true })

const authenticateStaff = authentication({ accountType: accountTypeEnum.staff })

// FR-ADMIN-01: Owner has full access -> only Owner can create the other staff accounts.
staffAuthRouter.post(
    "/staff",
    authenticateStaff,
    authorization({ roles: [staffRoleEnum.owner] }),
    validation(SV.createStaffSchema),
    SS.createStaff
)

// FR-AUTH-04
staffAuthRouter.post("/sign-in", validation(SV.signInSchema), SS.signIn)
staffAuthRouter.get("/refresh-token", SS.refresh_token)
staffAuthRouter.post("/logout", authenticateStaff, SS.logout)
staffAuthRouter.patch("/forget-password", validation(SV.forgetPasswordSchema), SS.forgetPassword)
staffAuthRouter.patch("/reset-password", validation(SV.resetPasswordSchema), SS.resetPassword)
staffAuthRouter.patch("/update-password", authenticateStaff, validation(SV.updatePasswordSchema), SS.update_Password)

staffAuthRouter.get("/profile", authenticateStaff, SS.getProfile)

export default staffAuthRouter
