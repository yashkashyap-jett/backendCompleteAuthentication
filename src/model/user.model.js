import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,"name is required to create an user"]
    },
    email:{
        type:String,
        required:[true,"email is required"],
        trim:true,
        lowercase:true,
        validate:{
            validator: validator.isEmail,
            message:"please enter a valid email address"
        },
        unique:true
    },
    password:{
        type:String,
        required:[true,"password is required"],
        minlength:[6,"password must be at least 6 characters long"],
        select:false
    },
    verified:{
        type:Boolean,
        default:false
    }

})

userSchema.pre("save", async function () {
    
if(!this.isModified("password")){
    return
}

const hashedPassword = await bcrypt.hash(this.password,10)

this.password = hashedPassword;

})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password)

    
};

const userModel = mongoose.model("user",userSchema)


export default userModel;