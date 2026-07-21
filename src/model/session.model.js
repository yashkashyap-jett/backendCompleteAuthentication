import mongoose from "mongoose"
import bcrypt from "bcrypt"
import userModel from "./user.model.js"
import { refreshToken } from "../controllers/auth.controllers.js"

const sessionSchema = new mongoose.Schema({

    userId:{
        type:String,
        ref:"user",
        required:[true,"user is required"]
    },
    refreshTokenHash:{
        type:String,
        required:[true,"refresh token is required"]
    },
    ip:{
        type:String,
        required:[true,"ip address is required"]
    },
    userAgent:{
        type:String,
        required:[true,"user agent is required"]
    },
    revoked:{
        type:Boolean,
        default:false
    }



},{
    timestamps:true
})


const sessionModel = mongoose.model("session",sessionSchema)

export default sessionModel;