const express= require("express");
const blogRouter=express.Router();
const {blogModel}=require("../models/blog.model")
const jwt=require('jsonwebtoken');
require("dotenv").config();
blogRouter.get("/",(req,res)=>{
    res.send({msg:"hi from blogs"})
})

blogRouter.post("/create",async (req,res)=>{
    const token=req.headers.authorization.split(" ")[1];
    try {
        if(token){
            jwt.verify(token,process.env.token_key,async(err,decoded)=>{
                if(decoded){
                    // building relationship b/w user and its blog
                    const author=decoded.userId;
                    const {title,content}=req.body;
                    const blog= new blogModel({title,content,author});
                    await blog.save();
                    res.send({msg:"Blog Created Successfully"})
                }else{
                    res.send({msg:"Wrong Token passed in headers",token})
                }
            })
        }
    } catch (error) {
        res.send({msg:"Something went wrong",err:error.message})
    }
})

blogRouter.get("/read",async (req,res)=>{
    const token=req.headers.authorization.split(" ")[1];
    try {
        if(token){
            jwt.verify(token,process.env.token_key,async(err,decoded)=>{
                if(decoded){
                    const uid=decoded.userId
                    // find blogs of logged in user
                    const blogs=await blogModel.find({author:uid});
                    res.send({msg:"All blogs of current user are sent Successfully",Blogs:blogs})
                }else{
                    res.send({msg:"wrong token"})
                }
            })
        }else{
            res.send({msg:"Please login first"})
        }
    } catch (error) {
        res.send({msg:"Something went wrong",err:error.message})
    }
    
})


module.exports={
    blogRouter
}