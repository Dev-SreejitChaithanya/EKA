const mongoose = require('mongoose')
const Schema = mongoose.Schema;

ObjectId = Schema.ObjectId

const couponSchema = new Schema({
    code:{
        type    : String,
         required:true
    },
    off:{type: Number,
         required:true},
    date:{type    : String,
         required:true},
    status:{type:String, 
         required:true},   
    userId:[{type:ObjectId}]
}) 

module.exports = mongoose.model('Coupon',couponSchema)