const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const userSchema  = new mongoose.Schema({

User:{
type:String,
ref:'user',
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
password:{
type:String,
required:true
},
age:{
    type:Number,
},
ph:{
    type:Number,
},
image:{
    type:String
},
address:{
    type:String,
},
group:{
    type:String,
}
})

userSchema.pre('save',async function(next){
    if(this.isModified('password')) {
this.password = await bcrypt.hash(this.password,10);
// this.confirmPass = await bcrypt.hash(this.confirmPass,10);
 }
 next();
})
const Usermodel = mongoose.model("user",userSchema)
module.exports = Usermodel