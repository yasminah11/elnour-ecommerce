export const find = async ({model , filteration ={}}={})=>
{
    const doc = model.find(filteration)
    return await doc.exec()
}
export const findOne =async ({model,check ={} , select = ""}={})=>{
    return await model.findOne(check).select(select)

}

export const create = async ({model , dataa ={}}={})=>
{
    return await model.create(dataa)
}


export const findOneAndUpdate = async({model , check = {} , update={}}={})=>
{
    return await model.findOneAndUpdate(check , update)
}

export const deleteMany = async({model , check = {}}={})=>
{
    return await model.deleteMany(check)
}

// used by crud.factory.listHandler for every paginated GET / list route
// (categories, products, variants, inventory, notifications, coupons, ...)
export const paginate = async ({ model, filter = {}, skip = 0, limit = 20, populate = [] } = {}) => {
    let query = model.find(filter).skip(skip).limit(limit)
    for (const path of populate) {
        query = query.populate(path)
    }
    const [result, total] = await Promise.all([
        query.exec(),
        model.countDocuments(filter)
    ])
    return { result, total }
}

// used by crud.factory.getOneHandler
export const findById = async ({ model, id, populate = [] } = {}) => {
    let query = model.findById(id)
    for (const path of populate) {
        query = query.populate(path)
    }
    return await query.exec()
}

// used by crud.factory.updateHandler
export const updateById = async ({ model, id, update = {} } = {}) => {
    return await model.findByIdAndUpdate(id, update, { new: true, runValidators: true })
}

// used by crud.factory.deleteHandler
export const deleteById = async ({ model, id } = {}) => {
    return await model.findByIdAndDelete(id)
}