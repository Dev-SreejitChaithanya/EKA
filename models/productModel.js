const { ObjectId } = require("mongodb");
const mongoose=require("mongoose");
const { array } = require("../middlewares/fileupload");

//User Schema Creation------------>
const productSchema=new mongoose.Schema({
    image:{
        type:Array
       
    },
    name:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:
    {
        type:Number,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    rating:{
        type:Number
    },
    deletedOn:
    {
        type:String,
        
    }

},
{
    timestamps: true,
  });

//Model Creation and export for use ---->
module.exports = mongoose.model('Product',productSchema)