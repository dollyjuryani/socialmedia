const express=require("express");
const bcrypt=require("bcryptjs");
const User=require("../models/user");
const {registerUser,loginUser, followUnfollow,getPostsOfFollowing, logout, updatePassword, updateProfile, deleteUser, myProfile, getUserId, getAllUsers,forgotPassword,resetpassword} = require("../controllers/user");
const auth=require("../middlewares/auth");

const router= express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/follow").get( auth.isAuthenticated,followUnfollow);

router.route("/getpostsoffollowing").get(auth.isAuthenticated,getPostsOfFollowing);

router.route("/logout").get(auth.isAuthenticated,logout);

router.route("/update/password").patch(auth.isAuthenticated,updatePassword);

router.route("/update/profile").patch(auth.isAuthenticated,updateProfile);

router.route("/delete").delete(auth.isAuthenticated,deleteUser);

router.route("/myprofile").get(auth.isAuthenticated,myProfile);

router.route("/user").get(auth.isAuthenticated,getUserId);

router.route("/users").get(auth.isAuthenticated,getAllUsers);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetpassword);







module.exports=router;