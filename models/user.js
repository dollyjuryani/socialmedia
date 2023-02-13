const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const crypto=require("crypto");

const UserSchema= new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter name"]
    },
    avatar:{
        public_id:String,
        url:String
    },
    email:{
        type:String,
        required:[true,"Please enter an email id"],
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:[6,"Min 6 characters required"],
        select:false
    },
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post"
        }
    ],
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    resetPasswordToken:String,
    resetPasswordExpire:Date
});

// UserSchema.pre("save",async(next) => {
    
//        this.password=await bcrypt.hash(this.password,10,() => {
        
//        });
//     next();
// });

UserSchema.methods.matchPassword = async function(password) {
    return bcrypt.compareSync(password,this.password);
};

UserSchema.methods.generatetoken = async function() {
   
    try {
        const token= await jwt.sign({ _id : this._id},process.env.JWT_SECRET);
        return token;
    } catch (error) {
        console.log(error);
    }
}

UserSchema.methods.getResetPasswordToken = function() {

    const resetToken= crypto.randomBytes(20).toString("hex");//not hashed
    console.log(resetToken);
    this.resetPasswordToken =crypto.createHash("sha256").update(resetToken).digest("hex");//hashed
    this.resetPasswordExpire=Date.now() + 10*60*1000;

    return resetToken;

};

module.exports = new mongoose.model("User",UserSchema);