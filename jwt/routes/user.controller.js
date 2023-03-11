const express= require("express");
const userRouter=express.Router();
const {userModel}=require("../models/user.model")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const fs=require("fs")
userRouter.post("/login",async (req, res) => {
    
    try {
    const { email, password } = req.body;

    const isUserPresent = await userModel.findOne({ email });

    if (!isUserPresent){
        return res.send("User not present, register please");
    }

    const isPasswordCorrect = await bcrypt.compareSync (password,isUserPresent.password);

    if (!isPasswordCorrect) {
        return res.send("Invalid credentials");
    }
    const token = await jwt.sign({ email, userId: isUserPresent._id, role: isUserPresent.role },process.env.token_key,{ expiresIn: "60s" });

    const refreshToken = await jwt.sign({ email, userId: isUserPresent._id },process.env.ref_token_key,{expiresIn: "280s"});

    res.send({ msg: "Login success", token, refreshToken });

    } catch (error) {
    res.send(error.message);
    }
}
);
userRouter.post("/register",async(req,res)=>{
    const {email,password,name}=req.body;
    try {
        bcrypt.hash(password,5,async(err,hash)=>{
            if(err){
                res.send({msg:"something went wrong",error:err.message})
            }else{
                const User= new userModel({name,email,password:hash});
                await User.save();
                res.send({msg:"New user has been registered"})
            }
        })
        
    } catch (error) {
        res.send({msg:"something went wrong",error:error.message})
    }
})

userRouter.get("/getnewtoken",async(req,res)=>{
    const refreshToken=req.headers.authorization.split(" ")[1];
    if(!refreshToken) res.send({msg:"plz login again"})

    jwt.verify(refreshToken,process.env.ref_token_key,async(err,decoded)=>{
        if(!decoded){
            res.send({msg:"plz login again",error:err})
        }else{
            const token = await jwt.sign({email:decoded.email,userId:decoded.userId},process.env.token_key,{ expiresIn: "60s" });
            res.send({msg:"Login Successfull and New token genrated successfully",Token:token})
        }
    })
})

userRouter.get("/logout",async(req,res)=>{
    const token=req.headers.authorization.split(" ")[1];
    try {
    const blacklist=JSON.parse(fs.readFileSync("./blacklist.json","utf-8"));
    blacklist.push(token);
    fs.writeFileSync("./blacklist.json",JSON.stringify(blacklist));
    res.status(200).send({msg:"Logout Successfull"})
    } catch (error) {
    res.send({msg:"something went wrong",err:error.message})
    }

})


module.exports={
    userRouter
}