import dotenv from "dotenv";
dotenv.config();


if(!process.env.MONGO_URI){
    throw new error("mongo uri is not present")
}

if(!process.env.JWT_SEC){
    throw new error("jwt sec is not present")
}

const config={
MONGO_URI : process.env.MONGO_URI,
JWT_SEC: process.env.JWT_SEC,
CLIENT_ID : process.env.CLIENT_ID,
CLIENT_SEC : process.env.CLIENT_SEC,
GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
GOOGLE_USER:process.env.GOOGLE_USER
}


export default config;