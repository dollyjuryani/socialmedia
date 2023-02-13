const express=require("express");
const Post=require("../models/post");
const User=require("../models/user");
const jwt=require("jsonwebtoken");
const auth=require("../middlewares/auth");
const { createPost,likepost,deletePost, updateCaption, addcomment, deleteComment } = require("../controllers/post");
const router=express.Router();

router.post("/upload",auth.isAuthenticated,createPost);

router.post("/like",auth.isAuthenticated,likepost);

router.delete("/delete",auth.isAuthenticated,deletePost);

router.put("/update/caption",auth.isAuthenticated,updateCaption);

router.put("/comment",auth.isAuthenticated,addcomment);

router.post("/delete/comment",auth.isAuthenticated,deleteComment);

module.exports=router;