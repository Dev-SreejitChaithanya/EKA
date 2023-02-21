const mongoose=require("mongoose");

//User Schema Creation------------>
const adminSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
});

//Model Creation and export for use ---->
module.exports = mongoose.model('Admin',adminSchema)