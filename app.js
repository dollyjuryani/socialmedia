const express=require("express");
const path=require("path");
const user= require("./routes/user");
const post = require("./routes/post");
const cookieparser=require("cookie-parser");

const app=express();

require("dotenv").config({path :path.resolve(__dirname,"config/config.env")});

//midlewares
app.use(cookieparser());
//app.use(express.urlencoded({extended:true}));
app.use(express.json());

//using routes
app.use("/api/post",post);
app.use("/api/user",user);


module.exports=app; 