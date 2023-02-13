const express=require("express");
const User=require("../models/user");

const jwt=require("jsonwebtoken");

exports.isAuthenticated = (async(req,res,next) =>{

    try {
        const {token}= req.cookies;
    if(!token)
    {
        return res.status(404).json({
            message:"Please Login first"
        });
    }

    const decoded=await jwt.verify(token,process.env.JWT_SECRET);
    req.user=await User.findById(decoded._id);
    next();

    } catch (error) {
        console.log(error);
        res.status(400).json({
            message:error.message
        });
    }
});


