const mongoose = require('mongoose');
const profileSchema = new mongoose.Schema({
    name:{
        type:String,
        default:'ADMIN'
    },
    email:{
        type:String,
        default:'CareClinic@gmail.com'
    },
    password:{
        type:String,
        default:'CareClinic@2023'
    },
    wallet:{
        type:Number
    }
})
const adminearns = mongoose.model('adminwallet',profileSchema)
module.exports = adminearns