const mongoose = require('mongoose');
const orderbookSchema = new mongoose.Schema({

    user_Id: {
        type: String,
        ref: 'user',
        required: true
      },
    name:{
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
    paymentMethod: String,
    orderStatus: String,
    
  

})
const order = mongoose.model("orderbook",orderbookSchema);
module.exports = order;