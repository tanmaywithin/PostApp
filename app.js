const cookieParser = require('cookie-parser');
const express= require('express');
const app=express();
const path =require('path')
require("dotenv").config(); 
const userModel=require("./models/user");
const postModel=require("./models/post");
const mongoose=require('mongoose');

const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken')


app.set("view engine","ejs")
app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI)



app.get("/",function(req,res){
    res.render("index");
});
app.get("/register", (req, res) => {
    res.render("index");   // ye register.ejs ko render karega
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/profile",isLoggedIn,async (req,res)=>{
    let user = await userModel.findOne({ email: req.user.email });

    // fetch all posts from all users 
    let posts = await postModel
  .find({})
  .populate("user")
  .sort({ createdAt: -1 });

    posts = posts.filter(post => post.user !== null);

    res.render("profile", { user, posts });

});
app.get("/like/:id",isLoggedIn,async (req,res)=>{
    let post = await postModel.findOne({ _id:req.params.id}).populate("user");
   if(post.likes.indexOf(req.user.userid)===-1){
     post.likes.push(req.user.userid);
   }
   else{
    post.likes.splice(post.likes.indexOf(req.user.userid),1);
   }
    
    await post.save();

    res.redirect("/profile");
});
app.get("/edit/:id",isLoggedIn,async (req,res)=>{
    let post = await postModel.findOne({ _id:req.params.id}).populate("user");
    
  res.render("edit",{post})
});
app.post("/update/:id",isLoggedIn,async (req,res)=>{
    let post = await postModel.findOneAndUpdate({ _id:req.params.id},{content:req.body.content});
    
    res.redirect("/profile")
});
app.post("/post",isLoggedIn,async (req,res)=>{
    let user= await userModel.findOne({email:req.user.email});
    let {content}=req.body;

   let post= await postModel.create({
        user:user._id,
        content
        })
    
    user.posts.push(post._id);
    await user.save();

    res.redirect("/profile");
});
app.post("/register", async (req,res)=>{

    let{username,name,email,password,age}=req.body;
    let user= await userModel.findOne({email});
    if(user)  return res.redirect("/login");
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async (err,hash)=>{
         let createdUser= await userModel.create({
               username,
               email,
               password: hash, 
                age,
                name
             })

             let token=jwt.sign({email:email, userid:createdUser._id},"tanmay");
             res.cookie("token",token);

             return res.redirect("/profile");
        })
    })
   
    
})
app.post("/login", async (req,res)=>{

    let{email,password}=req.body;
    
    let user= await userModel.findOne({email});
    if(!user) return res.redirect("/login");

    bcrypt.compare(password,user.password,function(err,result){
        if(result){ 
            let token=jwt.sign({email:email, userid:user._id},"tanmay");
            res.cookie("token",token);
            res.redirect("/profile");
        }
        else return res.redirect("/login");
    })
   
    
})
app.get("/logout",(req,res)=>{
    res.cookie("token","");
    return res.redirect("/login");
});

function isLoggedIn(req,res,next){
    if(req.cookies.token ==="") return res.redirect("/login");
    else{
        let data= jwt.verify(req.cookies.token,"tanmay");
        req.user=data;
        next();
    }
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
