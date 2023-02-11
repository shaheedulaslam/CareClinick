
const bcrypt = require('bcrypt');
const Usermodel = require('../models/user');
const appointmodel = require('../models/appointment');
const adddoctorsmodel = require('../models/doctors');
const order = require('../models/bookOrder');
const adminearns = require('../models/adminProfile');
const userHelpers = require('../helpers/userDatbase');
const { Result } = require('express-validator');
const nodemailer = require('nodemailer');
const { name } = require('ejs');
const crypto = require('crypto');
const { default: mongoose, Mongoose } = require('mongoose');
const Mail = require('nodemailer/lib/mailer');



const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
  port: 587,
  auth: {
      user: process.env.user,
      pass: process.env.pass
  } 
})



module.exports = {

    getHome: async(req, res) => {
        try {
            const userId = req.session.logg;
        const doctors = await adddoctorsmodel.findOne({})
        const doccount = await adddoctorsmodel.count();
        const appointcount = await appointmodel.find({user:userId}).count();
        const patients = await appointmodel.count();
        const bio = await Usermodel.findOne({_id:userId});
        const reports = await appointmodel.find({user:userId,consultations:"consulted"}).count()
        console.log(doccount,' '+"doctor added");
        console.log(appointcount,' '+"appoint added");
        const msg = doccount+appointcount+reports
        adddoctorsmodel.find().then(doclist=>{
            res.render('user/index', {user: req.session.logg,doclist,msg,appointcount,doccount,patients,bio,doctors,reports});
        })
        } catch (error) {
            console.log(error);
        }  
    },

    getlogin: (req, res) => {
        if (req.session.logg) {
            res.redirect('/login')
        } else {
            const error = req.session.loggerr
            res.render('user/login', { base_url: process.env.APP_URL, user: '', user: false, login: false, error })
            req.session.loggerr = null
        }
    },
    postLogin: async (req, res) => {
        try {
            let Email = req.body.email
            let PASS = req.body.password
            const user = await Usermodel.findOne({ email: Email})
            if (user && user.access){
                console.log(user);
                let data = await bcrypt.compare(PASS, user.password)
                if (data) {
                    req.session.logg = user
                    res.redirect('/')
                }
            } else {
                req.session.loggerr = "Invalid Email or Password"
                res.redirect('/login')
    
            }
        } catch (error) {
            console.log(error);
            res.redirect('/404error')
        }
       
    },
    getsignup: (req, res) => {
        res.render('user/signup', { base_url: process.env.APP_URL, user: '' })
    },
    postSignup: async (req, res) => {
        const { name, email, password, confirmPass } = req.body;
        if (!name || !email || !password || !confirmPass) {
            return res.status(422).json({ error: 'plz fill the property' });
        }

        try {
            const userExist = await Usermodel.findOne({ email: email });
            if (userExist) {
                return res.status(422).json({ error: 'Email already exist' })
            } else if (password != confirmPass) {
                // return res.status(422).json({ error: 'Password is not matchnig' })
                res.redirect('/signup')


            } else {
                var val = Math.floor(1000 + Math.random() * 9000);
                req.body.token = val
                req.session.signup = req.body

                transporter.sendMail({
                    to: email,
                    from: 'careclinick@gmail.com',
                    subject: 'Signup Verification',
                    html: `<h4>This your token for OTP Verfication </h4>:<h2>${val}</h2>`
                }) 
                res.render('user/signupotp')

            }
            console.log(req.body);

        } catch (err) {
            console.log(err)
            res.redirect('/404error')
        }
    },
    getappointment:async(req, res) => {
        try {
            await adddoctorsmodel.find().then(result=>{
                res.render('user/appointment', { base_url: process.env.APP_URL, user: '',result})
            })
        } catch (error) {
            console.log(error);
            res.redirect('/404error')
        }
        
    },
    Logout: (req, res) => {
        req.session.logg = null
        res.redirect('/')
    },
    postappointment:async(req, res) => {
        try {
            const userId = req.session.logg._id
            const name = req.body.name
            const email = req.body.email
            const ph = req.body.ph
            const speciality = req.body.speciality
            const doctor = req.body.dr
            const Date = req.body.date
            const Age = req.body.Age
            const disease = req.body.diseases
            const bookForm = new appointmodel({
    
        
                user: userId,
                name: name,
                email: email,
                ph: ph,
                doctor: doctor,
                speciality:speciality,
                date: Date,
                Age:Age,
                diseases: disease
            });
          await  bookForm.save().then(result => {
                console.log('appoint form added');
                res.redirect('/appointment')
                return transporter.sendMail({
                    to: email,
                    from: process.env.user,
                    subject: 'Appointment Status',
                    html: `<h1>${result.name}.. Your appointment is Successfully placed! for ${result.speciality} Department</h1>`
                })
                
            })
        } catch (error) {
            console.log(error);
            res.redirect('/404error')
        }
       
    },
    getappointlists:async(req, res) => {
        try {
        const userId = req.session.logg;
      await appointmodel.find({ user: userId}).then(books => {
            res.render('user/appointlists', { books });
        })
        } catch (error) {
            console.log(error);
            res.redirect('/404error')
        }
       
      
    },
    getverify: (req, res) => {
        try {
            const {name, email, password, confirmPass, token } = req.session.signup;
            if(req.query.id){
                console.log('keri');
                var val = Math.floor(1000 + Math.random() * 9000);
                    transporter.sendMail({
                        to: email,
                        from: process.env.user,
                        subject: 'Signup Verification',
                        html: `<h4>This your token for OTP Verfication </h4>:<h2>${val}</h2>`
                    })
            }
            req.session.signup.token=val
            res.render('user/signupotp')
        } catch (error) {
            console.log(error);
            res.redirect('/404error')
        }

    },
    postOtpverify: async (req, res) => {
        try {
            const {name, email, password, confirmPass, token } = req.session.signup;
        if (token == req.body.otp) {
            const user = new Usermodel({name, email, password })
            console.log(user);
            await user.save().then((doc) => {
                req.session.logg = doc
                res.redirect('/');
            }).catch(err=>{
                console.log(err);
            })
        } else {
            res.redirect('/verify')
            console.log('invalid otp');
        }
        } catch (error) {
            console.log(error);
            res.redirect('/404error')
        }
        
    },
    getpayment:async(req,res)=>{
        try {
            if(req.session.logg){
            const payId = req.params.id;
            const dctr =  req.params.dr;
            console.log(dctr,"uuuuuuuuu");
            console.log(payId);
           await appointmodel.findOne({_id:payId}).then(payee=>{
                console.log(payee,"aaaa okkk");
                res.render('user/payment',{payee,dctr})
            })
            }else{
                res.redirect('/login')
            }   
        } catch (error) {
            console.log(error);
            res.redirect('/404error');
        }
       
      
    },
    postpayment:async(req,res)=>{    
    try {
    const status = req.body['payment-method'] ==='COC'?'placed':'pending'
    console.log(req.body.dctr);
    const bookpay = new order({
        user_Id:req.body.userId,
        name:req.body.name,
        ph:req.body.phone,
        doctor:req.body.dctr,
        paymentMethod:req.body['payment-method'],
        orderStatus:status
    });
  await bookpay.save().then(result=>{
        console.log(result,'haaaaaaaaaaaaaaaaaaaaa');
        if(req.body['payment-method'] === 'COC'){
             res.json({codSuccess:true})
        }else{
            userHelpers.generateOrder(result).then((response)=>{
                console.log(response,"diiiiiiiiiiiiiiiiiiii");
                 res.json({response})
            })
        }
        console.log(bookpay,'booking completed'); 
    })
        } catch (error) {
           console.log(error);
           res.redirect('/404error'); 
        }   
    
    },
    verifyPayment:(req,res,next)=>{
    console.log(req.body);
        try{
            userHelpers.paymentVerify(req.body).then(async()=>{
                const id1 = req.body['order[receipt]']
                await order.findOneAndUpdate({_id:id1},{
                    $set:{orderStatus:'placed'}
                })
          const Totamount = req.body['order[amount]']
          const adminAmount =  40*Number(Totamount)/100
          const docAmount = Number(Totamount)-Number(adminAmount);
          console.log(adminAmount,"adminamount");
          console.log(docAmount,"doctoramount")
          const divide = await order.findOne({_id:id1})
          const docId = divide.doctor
          console.log(docId,"doctorId")
          const admin =  new adminearns({
            email:'CareClinic@gmail.com',

          })
          await admin.save();
          console.log(admin);
          const docadding = await adddoctorsmodel.findOneAndUpdate({_id:docId.trim()},{$inc:{wallet:docAmount}})
          const adminadd = await adminearns.findOneAndUpdate({email:'CareClinic@gmail.com'},{$inc:{wallet:adminAmount}})
          console.log(docadding,"nonn");
          console.log(adminadd,"hhggggg");
              res.json({status:true})
            }).catch((e)=>{
                res.json({status:false})
                // next(new Error(e))
                console.log(e);
               
            })
        }catch(e){
            next(new Error(e))
            res.redirect('/404error')
        }
    },
     success:(req,res)=>{
        try{
            res.render('user/success',{user:false})
        }catch(err){
            console.log(err);
            res.redirect('/404error')
        }
     },
     profile:async(req,res)=>{
        try {
            const uzer = req.session.logg
            const profId = req.params.id
           await Usermodel.findById(profId).then(bio=>{
               res.render('user/profile',{uzer,bio})
           })
        } catch (error) {
            console.log(error);
            res.redirect('/404error')
        } 
        
       
     },
     editprofile:async(req,res)=>{
        try {
            if(req.session.logg){
                const edId = req.params.id
                await Usermodel.findOne({_id:edId}).then(el=>{
                res.render('user/editprofile',{el});
                })
            }else{
                res.redirect('/login')
            }
        } catch (error) {
            console.log(error); 
            res.redirect('/404error')
        }  
     },
     postprofile:async(req,res)=>{
        try {
        const bioId = req.params.id
        const  name = req.body.name
        const email = req.body.email
        const age = req.body.age
        const group = req.body.group
        const ph = req.body.ph
        const address = req.body.address

        console.log(req.file,"avatar");
      const image=req.file.filename

       await Usermodel.updateOne({_id:bioId},{
            $set: {
            name:name,
            email:email,
            age:age, 
            group:group,
            ph:ph,
            address:address,
            image:image
           
            }
          }).then((result)=>{
            console.log(result,"updated"); 
            res.redirect(`/profile/${bioId}`);
        })
        } catch (error) {
            console.log(error);
            res.redirect('/404error')
        }
        
        
     },
     about:async(req,res)=>{
        try {
        const userId = req.session.logg;
        const doccount = await adddoctorsmodel.count();
        const appointcount = await appointmodel.find({user:userId}).count();
        const reports = await appointmodel.find({user:userId,consultations:"consulted"}).count()
        const msg = doccount+appointcount+reports
        const bio = await Usermodel.findOne({_id:userId});
        res.render('user/about',{user:req.session.logg,msg,doccount,appointcount,bio,reports});
        } catch (error) {
            console.log(error);
            res.redirect('/404error')
        }
       
     },
     contactus:async(req,res)=>{
        try {
            const userid = req.session.logg
            await Usermodel.findOne({_id:userid}).then(user=>{
                res.render('user/contactus',{user})
            })
        } catch (error) {
            console.log(error);
            res.redirect('/404error')
        }
       
        
     },
     contactUspost:(req,res)=>{
     try {
        console.log(req.body,"Contact form Submitted");
        const email = req.body.email
        const message = req.body.Address
         transporter.sendMail({
            to: process.env.user,
            from:email,
            subject:email,
            html:`<h4>${message}</h4>`
         })

        res.redirect('/contactUs');
     } catch (error) {
       console.log(error); 
       res.redirect('/404error')
     }
     },
    selectedAppoint:async(req,res)=>{
    try {
    console.log(req.body.speciality);
    const doc =  await  adddoctorsmodel.find({speciality:req.body.speciality})
    console.log(doc);
    res.json({doc}) 
    } catch (error) {
        console.log(error);
        res.redirect('/404error')
    }
     },
    forgetPassword :(req,res)=>{
        res.render('user/forgetpassword',{user: false, login: false});
    },
    postforgetPassword:async(req,res)=>{
        try {
            const email = req.body.email
            await Usermodel.findOne({email:email}).then(users=>{
                if(users){
                    res.redirect('/')
                    transporter.sendMail({
                        to:[users.email],
                        from: process.env.user,
                        subject:'Password Reset',
                        html:`<h4>To reset Your Password <a href="http://localhost:3000/resetPassword/${users._id}">Click Here</a>`
                    })  
                }else{
                    res.redirect('/forgetpassword')
                }
            })
        } catch (error) {
            console.log(error);
             res.redirect('/404error')
        }
       
    },
    resetPassword:async(req,res)=>{
        try {
            const authId = req.params.id
        console.log(authId,"authrrrrrrrrr")
        await Usermodel.findOne({_id:authId}).then(auth=>{
            res.render('user/resetPassword',{auth});
        })
        } catch (error) {
            console.log(error);
            res.redirect('/404error')
        }
        
        
    },
    postresetPassword:async(req,res)=>{
        try {
            const auth = req.body.userid
            const pass =req.body.password
            const hash  = await bcrypt.hash(pass,10)
            const user = await Usermodel.findOne({_id:auth})
            await Usermodel.updateOne({_id:auth},{$set:{password:hash}},{new:true}).then(result=>{
              console.log(result,"password update");
              res.redirect('/login');
              transporter.sendMail({
                to:[user.email],
                from:process.env.user,
                subject:'Status Of reset Password',
                html:`<h2>Your Password Is Successfully Updated</h2>`   
              })
            })
        } catch (error) {
            console.log(error);
            res.redirect('/404error');
        }
       
    },
    getReports:async(req,res)=>{
        try {
            const userId = req.session.logg;
        const doccount = await adddoctorsmodel.count();
        const appointcount = await appointmodel.find({user:userId}).count();
        const reports = await appointmodel.find({user:userId,consultations:"consulted"}).count()
        const msg = doccount+appointcount+reports
        const bio = await Usermodel.findOne({_id:userId});
      await  appointmodel.find({consultations:"consulted",user: userId}).then(result=>{
            console.log(result,"medical reports");
            res.render('user/medical-Reports',{user:req.session.logg,result,msg,bio,doccount,appointcount,reports})
        })
        } catch (error) {
            console.log(error);
            res.redirect('/404error');
        }
        
    },
    ERROR:(req,res)=>{
        res.render("404")
    }

    
}



