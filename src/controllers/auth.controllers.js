import jwt from "jsonwebtoken";
import userModel from "../model/user.model.js";
import crypto from "crypto"
import config from "../config/config.js";
import { token } from "morgan";
import sessionModel from "../model/session.model.js";
import { sendEmail } from "../services/email.service.js";
import { generateOtp, getOtpHtml } from "../utils/utils.js";
import otpModel from "../model/otp.model.js";

export async function register(req, res) {

    const { username, email, password } = req.body;

    const isAlreadyRegistered = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    });

    if (isAlreadyRegistered) {
        return res.status(409).json({
            message: "user is already registered with email/username"
        });
    }

    const user = await userModel.create({
        username,
        email,
        password
    });

    // Generate OTP
    const otp = generateOtp();

    // Generate HTML for email
    const html = getOtpHtml(otp);

    // Hash OTP
    const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    console.log("Generated OTP:", otp);
    console.log("Generated Hash:", otpHash);

    // Save OTP in database
    await otpModel.create({
        email,
        user: user._id,
        otpHash
    });

    // Verify what was actually saved
    const savedOtp = await otpModel.findOne({ email });
    console.log("Saved OTP Document:", savedOtp);

    // Send Email
    await sendEmail(
        email,
        "OTP Verification",
        `Your OTP code is ${otp}`,
        html
    );

    return res.status(201).json({
        message: "user registered successfully",
        user: {
            username: user.username,
            email: user.email,
            verified: user.verified
        }
    });
}

export async function login(req,res){

    const {email,password} = req.body

    const user = await userModel.findOne({email}).select("+password")

    if(!user){
        return res.status(401).json({
            message:"user with this email not found"
        })
    }

    if(!user.verified){
        return res.status(401).json({
            message:"email is not verified"
        })
    }

    const isPasswordValid = await user.comparePassword(password);

    if(!isPasswordValid){
        return res.status(401).json({
            message:"password is inncorrect"
        })
    }

    const refreshToken = jwt.sign({
        id:user._id
    },config.JWT_SEC,{expiresIn:"7d"})

    const session = await sessionModel.create({
        userId:user._id,
        refreshTokenHash:refreshToken,
        ip:req.ip,
        userAgent: req.headers["user-agent"]
    })

    const accesstoken = jwt.sign({
        id:user._id,
        session:session._id
    },config.JWT_SEC,{expiresIn:"15m"})

    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge:7*24*60*60*1000
    })



    res.status(200).json({message:"user logged-IN successfully",
        user:{
            username:user.username,
            email:user.email
        },
        accesstoken
    })
}

export async function getMe(req,res){

const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

if(!token){
    return res.status(401).json({message:"token not present"})
}

try {
    const decoded = jwt.verify(token, config.JWT_SEC);

    const user = await userModel.findById(decoded.id)

    res.status(200).json({
        message:"user data",
        user:{
            username:user.username,
            email:user.email
        }
    })


} catch (err) {
    return res.status(401).json({
        message: "Invalid or expired token"
    });
}

}

export async function refreshToken(req,res){

    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(401).json({message:"refresh token not present"})
    }

    const decoded = jwt.verify(refreshToken,config.JWT_SEC)

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked:false
    })

    if(!session){
        return res.status(401).json({
            message:"invalid refresh token"
        })
    }

    const accesstoken = jwt.sign({
        id:decoded.id,
    },config.JWT_SEC,{
        expiresIn:"15m"
    })

    const newRefreshToken = jwt.sign({
        id:decoded.id,
    },config.JWT_SEC,{
        expiresIn:"7d"
    })

    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex")

    session.refreshTokenHash=newRefreshTokenHash;
    await session.save();

    res.cookie("refreshToken", newRefreshToken , {
    httpOnly:true,
    secure:true,
    sameSite:"strict",
    maxAge:7*24*60*60*1000
    })
    res.status(200).json({message:"access token refreshed successfully",
        accesstoken
    })


}

export async function logout(req,res){

   const refreshToken = req.cookies.refreshToken

   if(!refreshToken){
    return res(200).json({message:"user already loggedOut"})
   }

   const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

   const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked:false
   })

   if(!session){
    return res.status(200).json({message:"invalid session"})
   }

   session.revoked=true;
   await session.save();

   res.clearCookie("refreshToken")
   res.status(200).json({
    message:"user logged out successfully"
   })
    
}

export async function logoutAll(req,res) {
    
   const refreshToken = req.cookies.refreshToken;

   if(!refreshToken){
    return res.status(400).json({
        message:"refresh token not found"
    })
   }

   const decoded = await jwt.verify(refreshToken,config.JWT_SEC)

   await sessionModel.updateMany({
    user:decoded.id,
    revoked:false
   },{
    revoked:true
   })

   res.clearCookie("refreshToken")

   res.status(200).json({
    message:"logged out from all deviced succesfully"
   })

}

export async function verifyEmail(req, res) {

    const { otp, email } = req.body;

    const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    const otpDoc = await otpModel.findOne({
        email,
        otpHash
    });

    if (!otpDoc) {
        return res.status(400).json({
            message: "invalid otp"
        });
    }

    const user = await userModel.findByIdAndUpdate(
        otpDoc.user,
        {
            verified: true
        },
        {
            new: true
        }
    );

    await otpModel.deleteMany({
        user: otpDoc.user
    });

    return res.status(200).json({
        message: "email verified successfully",
        user: {
            username: user.username,
            email: user.email,
            verified: user.verified
        }
    });

}


