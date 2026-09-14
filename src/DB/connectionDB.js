import mongoose from "mongoose"
import { DB_URI, DB_URI_LOCAL } from "../../config/config.service.js";

const checkConnectionDB = async ()=>
{
    const uri = process.env.NODE_ENV === "production" ? DB_URI : DB_URI_LOCAL
    try {
        await mongoose.connect(uri,
            {
                serverSelectionTimeoutMS:5000,
                // NOTE (performance): keep a small pool of ready connections instead
                // of opening a new one per request — this is a startup tuning value,
                // it does not change any request/response behavior.
                maxPoolSize:10,
                minPoolSize:2
            })
        console.log(`Connected successfully to server${uri}..❤️`);
    } catch (error) {
        console.error('sync to connect to the database.......', error);
    }
}

export default checkConnectionDB