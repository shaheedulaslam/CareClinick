const appointmodel = require('../models/appointment');
const nodemailer = require('nodemailer');
const moment = require('moment');
const bcrypt = require('bcrypt');
const adddoctorsmodel = require('../models/doctors');


const transporter2 = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.user,
    pass: process.env.pass
  } 
})

module.exports = {
  getdoctorhome:async(req, res) => {
    try {
      if (req.session.doctor) {
        const docId = req.session.doctor;
        const date = new Date()
        console.log(date, 'date')
        let month = date.getMonth()
        month = month + 1
        const year = date.getFullYear()
        console.log(month, 'ipo month', year, 'ipo year')
        const day = date.getDate()
     
        const applist = await appointmodel.aggregate([{ $match: { consultation:"accepted",doctor:docId._id }},
          { $addFields: { Day: { $dayOfMonth: '$date' }, Month: { $month: '$date' }, Year: { $year: '$date' } } },
          {
            $match: { Day: day, Year: year, Month: month }
          },
          {
            $group: {
              _id: {
                day: { $dayOfMonth: '$date' },
                name:"$name",
                ph:"$ph",
                consultation:"$consultation",
                consultations:"$consultations",
                _id:"$_id",
                date:"$date"
              },
     
            }
          }
     
        ])
         const appList = await appointmodel.find()
         const bio = await adddoctorsmodel.findOne({_id:docId})
         res.render("doctor/doctorpanel",{applist,bio});  
         } else {
           res.redirect("/doctor/doctorlogin");
         }
    } catch (error) {
      console.log(error);
      res.redirect('/404error')
    }
   
  },
  doctorLogin: (req, res) => {
    try {
      if (req.session.doctor) {
        res.redirect("/doctor");
      } else {
        let errmessage = req.session.doctorlog;
        req.session.doctorlog = null
        res.render("doctor/doctorlogin", { errmessage });
        errmessage = null
      }
    } catch (error) {
    console.log(error);
    res.redirect('/404error')
    }
    
  },
  doctorpost: async (req, res) => {
    try {
    const reqmail = req.body.email;
    const reqpass = req.body.password;
    const doctordtls =await adddoctorsmodel.findOne({email:reqmail})
    if(doctordtls){
      console.log(doctordtls);
      const data  = await bcrypt.compare(reqpass,doctordtls.password)
        if(data){
          req.session.doctor = doctordtls
          res.redirect('/doctor');
        }
      }else {
        req.session.doctorlog = null;
        res.redirect("/doctor/doctorlogin");
      }
     }catch (error) {
    console.log(error)
    res.redirect('/404error')
    } 
  },
  getconsultreciept:async(req,res)=>{
    try {
      if(req.session.doctor){
        let recId = req.params.id;
        console.log(recId);
        const docId = req.session.doctor;
        const bio = await adddoctorsmodel.findOne({_id:docId});
        await appointmodel.findOne({_id:recId}).then(consultfrm=>{
          console.log(consultfrm);
            res.render('doctor/doctorreciept',{consultfrm,bio});
        })
      }else{
        res.redirect('/doctor/doctorlogin')
      }
    } catch (error) {
      console.log(error);
      res.redirect('/404error')
    }
    
   
  },
  consultedresult:async(req,res)=>{
    try {
      if(req.session.doctor){
    const resultId= req.params.id;
    const prescription  = req.body.prescription
    console.log( req.body);
    const result = await appointmodel.findOneAndUpdate({_id:resultId},{$set:{consultations:"consulted",prescription:prescription}},{new:true})
    console.log(result+'yesssssssss');
    res.redirect('/doctor/doctorconsulted')
      }else{
        res.redirect('/doctor/doctorlogin')
      } 
    } catch (error) {
      console.log(error);
      res.redirect('/404error')
    }
    
  },

  getupcoming:async(req,res)=>{
    try {
      if(req.session.doctor){
      const docId = req.session.doctor;
      const date = new Date()
      console.log(date, 'date')
      let month = date.getMonth()
      month = month + 1
      const year = date.getFullYear()
      console.log(month, 'ipo month', year, 'ipo year')
      const day = date.getDate()

      const upcoming = await appointmodel.aggregate([{ $match: { consultation:"accepted" ,doctor:docId._id}},
      { $addFields: { Day: { $dayOfMonth: '$date' }, Month: { $month: '$date' }, Year: { $year: '$date' } } },
      {
        $match: { Day : {$gt:day},Year:{$gte:year},Month:{$gte:month}, }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$date' },
            name:"$name",
            ph:"$ph",
            consultation:"$consultation",
            consultations:"$consultations",
            _id:"$_id",
            date:"$date"
          },
   
        }
      }
   
    ])
       
    console.log(upcoming,"tomarrowsss appointments");

      const bio = await adddoctorsmodel.findOne({_id:docId});
        res.render('doctor/doc-upcomingappoint',{upcoming,bio});
  }else{
    res.redirect('/doctor/doctorlogin')
  }
      
    } catch (error) {
      console.log(error);
      res.redirect('/404error')
    }
  },
  getconsulted:async(req,res)=>{
    try {
      if(req.session.doctor){
      const docId = req.session.doctor;
      const bio = await adddoctorsmodel.findOne({_id:docId});
      await  appointmodel.find({consultations:"consulted",doctor:docId._id}).then(consulted=>{
          res.render('doctor/doctorconsulted',{consulted,bio})
      })
    }else{
      res.redirect('/doctor/doctorlogin')
    }
    } catch (error) {
      console.log(error);
      res.redirect('/404error')
    }
   
    
  },
  getdocbookings:async(req,res)=>{
    try {
      if(req.session.doctor){
      const docId = req.session.doctor;
      console.log(docId,"lllll");
      const bio = await adddoctorsmodel.findOne({_id:docId._id});
      console.log(docId._id,"okkkk");
      appointmodel.find({doctor:docId._id}).then(booklist=>{
        res.render('doctor/doctorbookings',{booklist,bio});
    })
  }else{
    res.redirect('/doctor/doctorlogin');
  }
    } catch (error) {
    console.log(error);
    res.redirect('/404error')
    }
  },
  deletebook:async(req,res)=>{
    try {
    let bookId = req.params.id
    console.log(bookId);
     await appointmodel.deleteOne({_id:bookId}).then(result=>{
        console.log(result+'booking deleted');
        res.redirect('/doctor/doctorbookings');
    })
    } catch (error) {
      console.log(error);
      res.redirect('/404error')
    }
    
  },
  getacceptbook:async(req,res)=>{
    try {
   let ptId = req.params.id;
   console.log(ptId);
   const resp =   await appointmodel.findOneAndUpdate({_id:ptId},{$set:{consultation:"accepted"}},{new:true})
    console.log(resp,"haaaaa");
    res.redirect('/doctor');

    transporter2.sendMail({
      to:resp.email,
      from:'careclinick@gmail.com',
      subject:'Pay to place Appointment',
      html:`<h3>To book your Appointment Completely  <a href="http://localhost:3000/payment/${resp._id}/${resp.doctor}">Click here</a>  to Pay and Consult</h3>`
     
    })
    } catch (error) {
      console.log(error);
      res.redirect('/404error')
    }
    
 },
  getmypatients:async(req,res)=>{
    try {
      if(req.session.doctor){
        const docId = req.session.doctor;
        const bio = await adddoctorsmodel.findOne({_id:docId});
      await appointmodel.find({consultations:"consulted",doctor:docId._id}).then((result)=>{
        console.log(result);
        res.render('doctor/doctormypatients',{result,bio});
      })
     }else{
        res.redirect('/doctor/doctorlogin')
      }
    } catch (error) {
      console.log(error);
      res.redirect('/404error')
    }
    
 
  },
  getresults:async(req,res)=>{
    try {
      if(req.session.doctor){
      const docId = req.session.doctor;
      const bio = await adddoctorsmodel.findOne({_id:docId});
      await appointmodel.find({consultations:"consulted",doctor:docId._id}).then(result=>{
        console.log(result);
        res.render('doctor/doctor-results',{result,bio});
      })
    }else{
      res.redirect('/doctor/doctorlogin')
    }
    } catch (error){
      console.log(error);
      res.redirect('/404error')
    }
  },
  logout:(req,res)=>{
    req.session.doctor=false
    console.log("Dr logouted");
    res.redirect('/doctor/doctorlogin');
  },
  docprofile:async(req,res)=>{
    try {
      if(req.session.doctor){
        const docId = req.session.doctor;
        const bio = await adddoctorsmodel.findOne({_id:docId});
        const doctor = req.params.id
        await adddoctorsmodel.findOne({_id:doctor}).then(el=>{
          res.render('doctor/doctorProfile',{bio,el})
        })
      }else{
        res.redirect('/doctor/doctorlogin')
      }
    } catch (error) {
      console.log(error);
      res.redirect('/404error')
    } 
  },
  editdocProfile:async(req,res)=>{
    try {
      if(req.session.doctor){
        const docId = req.session.doctor;
        const bio = await adddoctorsmodel.findOne({_id:docId});
        const edId = req.params.id
        await adddoctorsmodel.findOne({_id:edId}).then(doc=>{
          res.render('doctor/editdocProfile',{doc,bio})
        })
      }else{
        res.redirect('/doctor/doctorlogin')
      }
    } catch (error) {
      console.log(error);
      res.redirect('/404error')
    }
    
  },
  posteditdocPrfile:async(req,res)=>{
    try {
      const bioId = req.params.id
    const name = req.body.name
    const email = req.body.email
    const speciality = req.body.speciality
    const qualification = req.body.qualification

    console.log(req.file,'doc avatar')
    const image = req.file.filename

    await adddoctorsmodel.updateOne({_id:bioId},{
      $set:{
        name:name,
        email:email,
        speciality:speciality,
        qualification:qualification,
        image:image
      }
    }).then((result,)=>{
      console.log(result,"doc Updated");
      res.redirect(`/doctor/doctorProfile/${bioId}`);
    })
    } catch (error) {
      console.log(error);
      res.redirect('/404error')
    }
    
  },
  docforgetPassword:(req,res)=>{
      res.render('doctor/doc-forgetPassword')   
  },
  postdocforgetPassword:async(req,res)=>{
    try {
      const email = req.body.email
      await adddoctorsmodel.findOne({email:email}).then(doctor=>{
        if(doctor){
          res.redirect('/doctor/doctorlogin')
          transporter2.sendMail({
            to:[doctor.email],
            from:process.env.user,
            subject:'Doctor Password Reset',
            html:`<h4>Doctor..,To reset Your Password: <a href="http://localhost:3000/doctor/reset-docPassword/${doctor._id}">Click Here</a>`
          })
        }else{
          res.redirect('/doctor/doc-forgetPassword')
        }
      })
    } catch (error) {
      console.log(error);
      res.redirect('/404error')
    }
   
  },
  resetdocPassword:async(req,res)=>{
    try {
    const author = req.params.id
    console.log(author,"authrrr");
    await adddoctorsmodel.findOne({_id:author}).then(authr=>{
      res.render('doctor/reset-docPassword',{authr})
    })
    } catch (error) {
      console.log(error);
      res.redirect('/404error')
    }
    
  },
  postresetdocPassword:async(req,res)=>{
    try {
      const doc = req.body.userid
      const pass = req.body.password
      const hash = await bcrypt.hash(pass,10)
      const doct = await adddoctorsmodel.findOne({_id:doc})
    await adddoctorsmodel.updateOne({_id:doc},{$set:{password:hash}},{new:true}).then(result=>{
      console.log(result,"doctor password Updated");
      res.redirect('/doctor/doctorlogin');
      transporter2.sendMail({
        to:[doct.email],
        from:process.env.user,
        subject:'Dr..,Status Of Your Reset Password',
        html:`<h2>Hello Dr.., Your Password is Successfully Updated</h2>`
      })
    })
    } catch (error) {
      console.log(error);
      res.redirect('/404error')
    }
  },
   
};
