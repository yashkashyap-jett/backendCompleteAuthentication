import mongoose from "mongoose";
import config from "../config.js";

async function connectDB() {

    try{
    await mongoose.connect(config.MONGO_URI)
    console.log("connected with database");
    
    }catch(err){
        console.log("cant connect with database",err);
        
    }
}

export default connectDB;