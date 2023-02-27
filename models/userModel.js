const { Timestamp } = require("mongodb");
const mongoose=require("mongoose");
const Schema=mongoose.Schema
ObjectId = Schema.ObjectId;
//User Schema Creation------------>
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:
    {
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_verified:{
        type:Number,
        default:0
    },
    token:{
        type:String,
        default:''
    },
    block:{
        type:Boolean,
        default:false
    },
    cart:[{
        productId:{type:ObjectId},
        qty:{type:Number,default:0},
        _id:false
    }],
    Address:[{
        name:{type:String},
        mobile:{type:String},
        add:{type:String},
        city:{type:String},
        state:{type:String},
        pin:{type:Number}
    }],
    wallet:{ 
        type:Number,
        default:0

    }
    
  
},
{timestamps:true});

//Model Creation and export for use ---->
module.exports = mongoose.model('User',userSchema)