const mongoose=require('mongoose');

// mongoose.connect(``);
mongoose.connect("mongodb+srv://tanmaykhandelwal:Tanmay%402004@vibeshare.yfb3wda.mongodb.net/PostApp")
const userSchema= mongoose.Schema({
    username : String,
    name:String,
    email : String,
    password : String,
    age:Number,
    posts :[
        {type : mongoose.Schema.Types.ObjectId, ref:"post"}
    ]
});
module.exports=mongoose.model("user",userSchema)