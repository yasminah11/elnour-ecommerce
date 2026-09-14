import * as db_service from "../../DB/db.service.js"
import successResponse from "../utils/successes_response/succsses.response.js"

// Shared by every module below so that plain "table CRUD" (no special
// workflow) is one line per route instead of a hand-written service function
// per entity. Modules that need real business logic (cart, checkout,
// returns, inventory adjustments, ...) still write their own service
// functions and simply don't use this factory for those specific routes.

// GET /            list + pagination + optional extra filters from req.query
export const listHandler = ({ model, populate = [], buildFilter = (req) => ({}) }) =>
    async (req, res, next) => {
        const { page = 1, limit = 20 } = req.query
        const filter = buildFilter(req)
        const skip = (Number(page) - 1) * Number(limit)

        const { result, total } = await db_service.paginate({
            model,
            filter,
            skip,
            limit: Number(limit),
            populate
        })

        successResponse({
            res,
            data: { result, total, page: Number(page), limit: Number(limit) }
        })
    }

// GET /:id
export const getOneHandler = ({ model, populate = [], notFoundMessage = "NOT FOUND" }) =>
    async (req, res, next) => {
        const { id } = req.params
        const doc = await db_service.findById({ model, id, populate })
        if (!doc) {
            throw new Error(notFoundMessage, { cause: 404 })
        }
        successResponse({ res, data: doc })
    }

// POST /
export const createHandler = ({ model, buildData = (req) => req.body, message = "created" }) =>
    async (req, res, next) => {
        const doc = await db_service.create({ model, dataa: buildData(req) })
        successResponse({ res, status: 201, message, data: doc })
    }

// PATCH /:id
export const updateHandler = ({ model, buildUpdate = (req) => req.body, notFoundMessage = "NOT FOUND", message = "updated" }) =>
    async (req, res, next) => {
        const { id } = req.params
        const doc = await db_service.updateById({ model, id, update: buildUpdate(req) })
        if (!doc) {
            throw new Error(notFoundMessage, { cause: 404 })
        }
        successResponse({ res, message, data: doc })
    }

// DELETE /:id
export const deleteHandler = ({ model, notFoundMessage = "NOT FOUND", message = "deleted" }) =>
    async (req, res, next) => {
        const { id } = req.params
        const doc = await db_service.deleteById({ model, id })
        if (!doc) {
            throw new Error(notFoundMessage, { cause: 404 })
        }
        successResponse({ res, message })
    }
