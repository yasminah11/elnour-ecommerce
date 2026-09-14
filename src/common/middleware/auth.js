import { ACCESS_SEUCRIT_KEY, PERFIX } from "../../../config/config.service.js";
import * as db_service from "../../DB/db.service.js";
import authModel from "../../DB/models/auth.model.js";
import staffModel from "../../DB/models/staff.model.js";
import { get, revoke_key } from "../../DB/redis/redis.service.js";
import { verifyToken } from "../utils/token/token.service.js";
import { accountTypeEnum } from "../enum/auth.enum.js";

const modelsByAccountType = {
    [accountTypeEnum.user]: authModel,
    [accountTypeEnum.staff]: staffModel
}

// accountType decides whether the token/collection belongs to the
// Customer API ("/auth/user") or the Staff/Admin API ("/auth/admin").
export const authentication = ({ accountType = accountTypeEnum.user } = {}) => {
    return async (req, res, next) => {
        const { auth } = req.headers;

        if (!auth) {
            throw new Error("token not exist", { cause: 403 });
        }

        const [perfix, token] = auth.split(" ");

        if (perfix !== PERFIX) {
            throw new Error("inValid Token perfix");
        }

        let decoded;
        try {
            decoded = verifyToken({
                token,
                seucrit: ACCESS_SEUCRIT_KEY
            });
        } catch (err) {
            throw new Error(err.message, { cause: 401 });
        }

        if (!decoded || !decoded.authId || decoded.accountType !== accountType) {
            throw new Error("inValid Token");
        }

        const model = modelsByAccountType[accountType];

        const authData = await db_service.findOne({
            model,
            check: { _id: decoded.authId }
        });

        if (!authData) {
            throw new Error("auth NOT FOUND", { cause: 404 });
        }

        req.auth = authData;
        req.decoded = decoded;
        req.accountType = accountType;

        if (
            req.auth.changeCredential &&
            req.auth.changeCredential.getTime() > decoded.iat * 1000
        ) {
            throw new Error("Token Expired");
        }

        const revoked = await get({
            key: revoke_key({
                authId: req.auth._id,
                jti: req.decoded.jti
            })
        });

        if (revoked) {
            throw new Error("revokeToken Expired");
        }

        next();
    };
};

// FR-CART-01: used by the cart router so guests can shop without an account.
// Same checks as `authentication`, but never throws — if no token, a bad
// token, or a mismatched accountType is present it just calls next() without
// setting req.auth, so the guest x-session-id path in cart.service.js kicks in.
export const optionalAuthentication = ({ accountType = accountTypeEnum.user } = {}) => {
    return async (req, res, next) => {
        try {
            const { auth } = req.headers;
            if (!auth) {
                return next();
            }

            const [perfix, token] = auth.split(" ");
            if (perfix !== PERFIX || !token) {
                return next();
            }

            let decoded;
            try {
                decoded = verifyToken({
                    token,
                    seucrit: ACCESS_SEUCRIT_KEY
                });
            } catch (err) {
                return next();
            }

            if (!decoded || !decoded.authId || decoded.accountType !== accountType) {
                return next();
            }

            const model = modelsByAccountType[accountType];

            const authData = await db_service.findOne({
                model,
                check: { _id: decoded.authId }
            });

            if (!authData) {
                return next();
            }

            if (
                authData.changeCredential &&
                authData.changeCredential.getTime() > decoded.iat * 1000
            ) {
                return next();
            }

            const revoked = await get({
                key: revoke_key({
                    authId: authData._id,
                    jti: decoded.jti
                })
            });

            if (revoked) {
                return next();
            }

            req.auth = authData;
            req.decoded = decoded;
            req.accountType = accountType;

            next();
        } catch (err) {
            next();
        }
    };
};