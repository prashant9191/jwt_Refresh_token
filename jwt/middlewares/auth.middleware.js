const jwt = require("jsonwebtoken");
require("dotenv").config();
const fs=require("fs");
const authenticator = async (req, res, next) => {
    const token = req.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
        return res.status (401).send({ msg: "Please login" });
        }
        //checking the token passed Is it blacklisted or not
        const blacklist=JSON.parse(fs.readFileSync("./blacklist.json","utf-8"));
        for(let i=0;i<blacklist.length;i++){
            if(token==blacklist[i]){
                return res.status(401).send({msg:"You are Blacklisted and Unauthoriesd with this Token, Kindly login again or contact Admin"})
            }
        }
        //verifying token
        const isTokenValid = await jwt.verify(token,process.env.token_key);
        if (!isTokenValid){
            return res.status (403).send({ msg: "Authentication failed, please login again." });
        }
        next();
    } catch (error) {
        data();
        //function to redirect once user passes refresh token after expriration of normal token
    async function data(){
        fetch("http://localhost:4500/user/getnewtoken",{
            method:"GET",
            headers:{
                Authorization:`Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then((response) => response.json())
        .then((data) => {
            if(data.Token){
                if(req.method=="GET"){
                    //for get routes
                    redirector(data.Token,req.url,req.method,res,data.Token)
                }else{
                    //for post/patch routes
                    redirector_post(data.Token,req.url,req.method,res,req.body,data.Token)
                }
                
            }else{
                res.send({msg:data.msg,error:data.error})
            }
        })
        .catch((error) => {
        console.error("Error:", error);
        });
        
    }
    }
};



//redirecting function again after validating refresh token to blogs 
// function for get methods
function redirector(token,url,Method,res,token){
    fetch(`http://localhost:4500${url}`,{
            method:Method,
            headers:{
                Authorization:`Bearer ${token}`,
                "Content-Type": "application/json"
            },
          
        })
        .then((response) => response.json())
        .then((data) => {      
            res.send({New_Token:token,data})      
        })
        .catch((error) => {
        console.error("Error:", error);
        });
 }

//  function for post,patch methods
function redirector_post(token,url,Method,res,obj,token){
    fetch(`http://localhost:4500${url}`,{
            method:Method,
            headers:{
                Authorization:`Bearer ${token}`,
                "Content-Type": "application/json"
            },
          body:JSON.stringify(obj)
        })
        .then((response) => response.json())
        .then((data) => {  
            res.send({New_Token:token,data})   
        })
        .catch((error) => {
        console.error("Error:", error);
        });
 }
 
 module.exports = { authenticator };