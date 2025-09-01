const mongoose=require('mongoose');

// mongoose.connect(``);


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