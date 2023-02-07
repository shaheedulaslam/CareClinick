const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const adddoctorSchema = new mongoose.Schema({

    // doctors:{
    //     type:String,
    //     ref:'doctors',
    //     required:true
    // },
    name:{
        type:String,
        required:true
    },
    access:{
        type:Boolean,
        default:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    speciality :{
        type:String,
        required:true
    },
    qualification:{
        type:String,
        required:true
    },
    earned:{
        type:Number,
        required:true
    },
    image:{
        type:String,
    },
    wallet:{
        type:Number
    }

})
adddoctorSchema.pre('save',async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,10);
    }
    next();
})
const adddoctorsmodel = mongoose.model("doctors",adddoctorSchema)
module.exports = adddoctorsmodel 