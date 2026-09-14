// FR-ADMIN-01 to FR-ADMIN-07: each staff role is allowed only the functions
// configured for it. This middleware enforces that server-side (NFR-SEC-01),
// on req.auth.role which is set by the staff authentication middleware.
export const authorization = ({roles = []}={})=>{
    return async (req , res , next)=>{
        if(!roles.includes(req.auth.role))
        {
            throw new Error("UnAuthorization" ,{cause:403});
        }
        next()
    }
}
