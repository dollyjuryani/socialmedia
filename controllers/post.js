const Post=require("../models/post");
const User=require("../models/user");

exports.createPost = (async(req,res) => {
    try {
        const newPostData={
            caption:req.body.caption,
            image:{
                public_id:"req.body.public_id",
                url:"req.body.url"
            },
            owner:req.user._id
        };

        const newPost=await Post.create(newPostData);

        const user=await User.findById(req.user._id);
        user.posts.push(newPost._id);
        await user.save();


        res.status(200).json({
            success:true,
            newPost
        });
        
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success:false,
            message: err.message
        });
    }
});

exports.likepost = async(req,res) => {
    try {
        const findpost=await Post.findById(req.body._id);

        if(!findpost)
        {
            return res.status(404).json({success:false, message:"No post found"});
        }

        const findlikeId=await findpost.likes.includes(req.user._id);
        if(findlikeId)
        {
            findpost.likes.pull(req.user._id);
            await findpost.save();
            res.status(200).json({
                success:true,
                message:"Post Unliked"
            });
    
        }        
        else
        {
            findpost.likes.push(req.user._id);
            await findpost.save();
            res.status(200).json({
                success:true,
                message:"Post liked"
            });    
        }        
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success:false,
            message: err.message
        });
    }
};

exports.deletePost = async(req,res) =>{
    try {
        const myid=await User.findById(req.user._id);
        const findpost=await Post.findById(req.body._id);

        if(!findpost)
        {
            return res.status(404).json({success:false, message:"No post found"});
        }

        if(findpost.owner.toString() != myid._id.toString() )
        {
            return res.status(404).json({
                success:false,
                message: "you can only delete your post"
            }); 
        }
        else
        {         
            await findpost.remove();       
            myid.posts.pull(findpost);
            await myid.save();

            res.status(200).json({
                success:true,
                message:"Post deleted"
            });  
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message: error.message
        });        
    }
};

exports.updateCaption = async(req,res) =>{
    try {
        
        const { _id, caption }=req.body;

        const searchpostId=await Post.findById(_id);

        if(searchpostId.owner.toString() != req.user._id.toString() )
        {
            return res.status(400).json({
                success:false,
                message: "You can only update your posts"
            });   
        }

        searchpostId.caption=caption;
        await searchpostId.save();

        res.status(200).json({
            success:true,
            message: "Caption updated"
        });   
        

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message: error.message
        });   
    }
};

exports.addcomment = async(req,res) => {
    try {

        const { _id, comment }= req.body;

        const post=await Post.findById(_id);
        if(!post)
        {
            return res.status(400).json({
                success:false,
                message: "Post not found"
            }); 
        }

        //update comment if already commented
        let commentIndex=-1;
        post.comments.forEach((element,index) => {
            if(element.user.toString() == req.user._id.toString())
            {
                commentIndex=index;
            }
        });

        if(commentIndex != -1)
        {
            post.comments[commentIndex].comment=comment;
            await post.save();
            res.status(200).json({
                success:true,
                message:"Comment Updated",
                post
            }); 
        }
        //adding comment if haven't commented yet
        else
        {
            post.comments.push({
                user:req.user._id,
                comment:comment
            });
            await post.save();
    
            res.status(200).json({
                success:true,
                message:"Comment added",
                post
            }); 
        }      
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message
        }); 
    }
};

exports.deleteComment = async(req,res) => {
    try {
        
        const { postid }=req.body;
        const post=await Post.findById(postid);
        if(!post)
        {
            return res.status(400).json({
                success:false,
                message: "Post not found"
            }); 
        }

        let commentIndex=-1;

        post.comments.forEach((element,index) => {
            if(element.user.toString() === req.user._id.toString())
            {
                commentIndex=index;
            }
        });
        if(commentIndex == -1)
        {
            return res.status(400).json({
                success:false,
                message: "comment not found"
            }); 
        }

        post.comments.splice(commentIndex,1);
        await post.save();
        res.status(200).json({
            success:true,
            message: "Comment deleted"
        }); 


    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message
        }); 
    }
};