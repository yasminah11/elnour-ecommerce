import { EventEmitter } from "node:events";
import { emailEnum } from "../../enum/email.enum.js";

export const eventEmitter = new EventEmitter()

// fn() here runs detached from any HTTP request/response cycle (it's fired
// with eventEmitter.emit and never awaited by the route handler), so Express's
// error middleware can never see a rejection from it. Left unguarded, a failed
// email send (e.g. bad SMTP credentials) becomes an unhandled promise
// rejection that crashes the whole Node process. This catch only stops that
// crash and logs it — it does not change what the API returns to the client.
eventEmitter.on(emailEnum.confirmeEmail , async(fn)=>{
    try {
        await fn()
    } catch (error) {
        console.error("background email job failed:", error.message)
    }
})
