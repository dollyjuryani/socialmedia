//const express=require("express");
const bcrypt=require("bcryptjs");
const crypto=require("crypto");
const { trusted } = require("mongoose");
const Post=require("../models/post");
const User=require("../models/user");
const {sendemail} =require("../middlewares/sendemail")

exports.registerUser = (async(req,res) =>{
    try {
        const { name,email,password }=req.body;
        let userFound=await User.findOne({email});

        if(userFound)
        {
            return res.status(400).json({
                success:false,
                message:"User already exists."
            });
        }

        const hashedPassword = bcrypt.hashSync(password,10);

        userFound= await new User({
            name,
            email,
            password:hashedPassword,
            avtar:
            {
                public_id:"Sample_id",
                url:"Sample_url"
            }
        });

        await userFound.save();

        const token=await userFound.generatetoken();
        const options={
            expires:new Date(Date.now() + 90*24*60*60*1000),
            httpOnly:true
        };

        res.status(200).cookie("token",token,options).json({
            success:true,
            userFound,
            message:`${email} is registered and logged in`,
            token
        });


    } catch (err) {
        res.status(404).json({
            success:false,
            message: err.message
        });
    }
});

exports.loginUser =async(req,res) => {
    try {
        const { email,password }=req.body;
        const userFound=await User.findOne({email}).select("password");
        if(!userFound)
        {
            res.status(404).json({
                success:false,
                message:"No user exits"
            });
        }
        const isCorrectPassword=await userFound.matchPassword(password);
        if(!isCorrectPassword)
        {
            return res.status(400).json({
                success:false,
                message:"Incorrect password"
            });
        }

        const token=await userFound.generatetoken();
        const options={
            expires:new Date(Date.now() + 2*60*1000),
            httpOnly:true
        };

        res.status(200).cookie("token",token,options).json({
            success:true,
            message:`${email} is logged in`
        });
        
    } catch (error) {
        res.status(404).json({
            success:false,
            message:error.message
        });
    }
};

exports.logout = async(req,res) =>{
    try {

        const loggedUser=await User.findById(req.user._id);

        res.status(200).cookie("token",null,{
            expires:new Date(Date.now()),
            httpOnly:true
        }).json({
            success:true,
            message:`${loggedUser.name} is logged out`
        });
        
    } catch (error) {
        res.status(404).json({
            success:false,
            message:error.message
        });
    }
}

exports.followUnfollow = async(req,res) => {
    try {
        
        const followid= await User.findById(req.body._id);
        const loggedUser= await User.findById(req.user._id);
        if(!followid)
        {
            return res.status(404).json({
                success:false,
                message:"No user found"
            });
        }

        if(loggedUser.following.includes(followid._id))
        {            
            const index=loggedUser.following.indexOf(followid._id);
            loggedUser.following.splice(index,1);

            const index2=followid.followers.indexOf(loggedUser._id);
            followid.followers.splice(index2,1);

            await loggedUser.save();
            await followid.save();

            res.status(200).json({
                success:true,
                message:`You have unfollowed ${followid.name}`
            });

        }
        else
        {
            loggedUser.following.push(followid._id);
            followid.followers.push(loggedUser._id);
            await loggedUser.save();
            await followid.save();

            res.status(200).json({
                success:true,
                message:`You are now following ${followid.name}`
            });
        }

    } catch (error) {
        console.log(error);
        res.status(404).json({
            success:false,
            message:error.message
        });
    }
}; 

exports.getPostsOfFollowing =async(req,res) => {
    try {
        
        const user=await User.findById(req.user._id);
        const posts=await Post.find({
            owner: {
                $in : user.following
            }
        });

        res.status(200).json({
            success:true,
            posts
        });


    } catch (error) {
        console.log(error);
        res.status(404).json({
            success:false,
            message:error.message
        });
    }
};

exports.updatePassword = async(req,res) =>{
    try {
        
        const updateId= await User.findById(req.user._id).select("password");
        const oldPassword=req.body.oldpassword;
        const newPassword=req.body.newpassword;

        const checkOldPass=await updateId.matchPassword(oldPassword);
        if(!checkOldPass)
        {
            return res.status(404).json({
                success:false,
                message:"Incorrect old Password"
            });
        }

        updateId.password=  bcrypt.hashSync(newPassword,10);
        await updateId.save();

        res.status(200).json({
            success:true,
            message:"Password Updated"
        });
        
    } catch (error) { 
        console.log(error);
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

exports.updateProfile = async(req,res) =>{
    try {

        const updateuser=await User.findById(req.user._id);
        const { name, email } =req.body;

        if(email)
        {
            updateuser.email=email;
        }
        if(name)
        {
            updateuser.name=name;
        }
        await updateuser.save();
        res.status(200).json({
            success:true,
            message:"Profile updated"
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

exports.deleteUser = async(req,res) => {
    try {

        const usertodelete= await User.findById(req.user._id);
        const userfollowers= usertodelete.followers;
        const followinguser=usertodelete.following;
        
        const postsofuser = usertodelete.posts;

        //delete all posts of user
        for(let i=0;i<postsofuser.length;i++)
        {
            const deletepost= await Post.findById(postsofuser[i]);
            deletepost.remove();
        }

        //delete from follower's following
        for(let i=0;i<userfollowers.length;i++)
        {
            const x= await User.findById(userfollowers[i]);
            //console.log(x);
            const index=x.following.indexOf(usertodelete._id);
            x.following.splice(index,1);
            
            await x.save();
        }

        //delete from following's followers
        for(let i=0;i<followinguser.length;i++)
        {
            const y= await User.findById(followinguser[i]);
            //console.log(x);
            const index=y.followers.indexOf(usertodelete._id);
            y.followers.splice(index,1);
            
            await y.save();
        }
         //delete user
        await usertodelete.remove();

        //logout user after deleting
        res.cookie("token",null,{
            expires:new Date(Date.now()),
            httpOnly:true
        });

        res.status(200).json({
            success:true,
            message:"account successfully deleted"
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

exports.myProfile = async(req,res) => {
    try {
        
        const me=await User.findById(req.user._id);

        res.status(200).json({
            success:true,
            me
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

exports.getUserId = async(req,res) =>{
    try {
        
        const userprofile=await User.findById(req.body._id);
        if(!userprofile)
        {
            return res.status(400).json({
                success:false,
                message:"No user found"
            });
        }

        res.status(200).json({
            success:true,
            userprofile
        });

    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

exports.getAllUsers = async(req,res) => {
    try {
        
        const usersprofile=await User.find({}).populate("posts");
        if(!usersprofile)
        {
            return res.status(400).json({
                success:false,
                message:"No user found"
            });
        }

        res.status(200).json({
            success:true,
            usersprofile
        });

    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

exports.forgotPassword = async(req,res) => {
    try {

        const useremail = await User.findOne({email:req.body.email});
        if(!useremail)
        {
            return res.status(400).json({
                success:false,
                message:"User not found"
            }); 
        }

       const resetPasswordToken=useremail.getResetPasswordToken();
       await useremail.save();

       const resetUrl=`${req.protocol}://${req.get("host")}/api/user/password/reset/${resetPasswordToken}`;
       const message = `Reset your password by clicking on the link below: \n\n ${resetUrl}`;

       try {

        await sendemail({
            email:useremail.email,
            subject:"Reset Password",
            message
        });

        res.status(200).json({
            success:true,
            message: `Email sent to ${useremail}`
        }); 

       } catch (error) {

        useremail.resetPasswordToken=undefined;
        useremail.resetPasswordExpire=undefined;
        await useremail.save();

        res.status(500).json({
            success:false,
            message: error.message
        }); 
       }
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message
        }); 
    }
};

exports.resetpassword = async(req,res) => {
    try {
        
        const resetpasstoken=crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user=await User.findOne(  {
            resetpasstoken,
            resetPasswordExpire:{$gt: Date.now()}
        });

        if(!user)
        {
            res.status(401).json({
                success:false,
                message: "Token has expired or invalid token"
            }); 
        }

        user.password=await bcrypt.hashSync(req.body.password,10);
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;

        await user.save();
        res.status(200).json({
            success:true,
            message: "password changed successfully"
        }); 


    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message
        }); 
    }
};