const express=require("express");
const app=express();
require("dotenv").config();
const {connection}=require("./configs/db")
const {authenticator}=require("./middlewares/auth.middleware")
const {blogRouter}=require("./routes/blog.controller")
const {userRouter}=require("./routes/user.controller")
app.use(express.json());
app.use("/user",userRouter);
app.use(authenticator);
app.use("/blog",blogRouter)


app.listen(process.env.port,async()=>{
        try {
            await connection;
            console.log("Connected to Db")
        } catch (error) {
            console.log(error)
        }
        console.log(`http://localhost:${process.env.port}/`)
})