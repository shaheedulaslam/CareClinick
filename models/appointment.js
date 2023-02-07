const mongoose = require('mongoose');
const userbookSchema = new mongoose.Schema({
    user:{
        type:String,
        ref:'user',
        required:true
    },
    access:{
        type:Boolean,
        default:true
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    ph:{
        type:Number,
        required:true
    },
    doctor:{
        type:String,
        ref:'doctors',
        required:true
    },
    speciality:{
        type:String
    },
    date:{
        type:Date,
        required:true
    },
    Age:{ 
        type:Number,
        required:true
    },
    diseases:{
        type:String,
        required:true
    },
    consultation:{
        type:String,
        default:"pending"
    },
    consultations:{
        type:String,
        default:"checking"
    },
    prescription:{
      type:String  
    }
})
const appointmodel = mongoose.model("userbook",userbookSchema);
module.exports = appointmodel;


