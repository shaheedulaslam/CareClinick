const appointmodel = require('../models/appointment');
const nodemailer = require('nodemailer');
const moment = require('moment');
const bcrypt = require('bcrypt');
const adddoctorsmodel = require('../models/doctors');


const transporter2 = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
      user: 'careclinick@gmail.com',
      pass: 'emazmmogyyruxpqv'
  } 
})

module.exports = {
  getdoctorhome:async(req, res) => {
    if (req.session.doctor) {
      // const amount = await adddoctorsmodel.find()
   const docId = req.session.doctor;
   const bio = await adddoctorsmodel.findOne({_id:docId});
    await appointmodel.find({consultation:"accepted",doctor:docId._id}).then(applist=>{
    res.render("doctorpanel",{applist,bio});
    })
    .catch(err => {
      console.log(err);
  })
     
    } else {
      res.redirect("/doctor/doctorlogin");
    }
  },
  doctorLogin: (req, res) => {
    try {
      if (req.session.doctor) {
        res.redirect("/doctor");
      } else {
        let errmessage = req.session.doctorlog;
        req.session.doctorlog = null
        res.render("doctorlogin", { errmessage });
        errmessage = null
      }
    } catch (error) {
    console.log(error);
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
    } 
  },
  getconsultreciept:async(req,res)=>{
    let recId = req.params.id;
    console.log(recId);
    const docId = req.session.doctor;
    const bio = await adddoctorsmodel.findOne({_id:docId});
    await appointmodel.findOne({_id:recId}).then(consultfrm=>{
      console.log(consultfrm);
        res.render('doctorreciept',{consultfrm,bio});
    })
    .catch(err => {
      console.log(err);
  })
   
  },
  consultedresult:async(req,res)=>{
    try {
    const resultId= req.params.id;
    const prescription  = req.body.prescription
    console.log( req.body);
    const result = await appointmodel.findOneAndUpdate({_id:resultId},{$set:{consultations:"consulted",prescription:prescription}},{new:true})
    console.log(result+'yesssssssss');
    res.redirect('/doctor/doctorconsulted')   
    } catch (error) {
      console.log(error);
    }
    
  },

  getupcoming:async(req,res)=>{
    try {
      const docId = req.session.doctor;
      const bio = await adddoctorsmodel.findOne({_id:docId});
     await appointmodel.find({consultations:"consulted",doctor:docId._id}).then(checked=>{
        res.render('doc-upcomingappoint',{checked,bio});
      })
    } catch (error) {
      console.log(error);
    }
  },
  getconsulted:async(req,res)=>{
    const docId = req.session.doctor;
    const bio = await adddoctorsmodel.findOne({_id:docId});
    await  appointmodel.find({consultations:"consulted",doctor:docId._id}).then(consulted=>{
        res.render('doctorconsulted',{consulted,bio})
    })
    .catch(err => {
      console.log(err);
  })
    
  },
  getdocbookings:async(req,res)=>{
    try {
      const docId = req.session.doctor;
      console.log(docId,"lllll");
      const bio = await adddoctorsmodel.findOne({_id:docId._id});
      console.log(docId._id,"okkkk");
      appointmodel.find({doctor:docId._id}).then(booklist=>{
        res.render('doctorbookings',{booklist,bio});
    })
    .catch(err => {
      console.log(err);
  })
    } catch (error) {
    console.log(error);  
    }
  },
  deletebook:async(req,res)=>{
    let bookId = req.params.id
    console.log(bookId);
     await appointmodel.deleteOne({_id:bookId}).then(result=>{
        console.log(result+'booking deleted');
        res.redirect('/doctor/doctorbookings');
    })
    .catch(err => {
      console.log(err);
  })
  },
  getacceptbook:async(req,res)=>{
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
    .catch(err => {
      console.log(err);
  })

 },
  getmypatients:async(req,res)=>{
      const docId = req.session.doctor;
      const bio = await adddoctorsmodel.findOne({_id:docId});
    await appointmodel.find({consultations:"consulted",doctor:docId._id}).then((result)=>{
      console.log(result);
      res.render('doctormypatients',{result,bio});
    }).catch(err=>{
      console.log(err);
    })
  },
  getresults:async(req,res)=>{
    try {
      const docId = req.session.doctor;
      const bio = await adddoctorsmodel.findOne({_id:docId});
      await appointmodel.find({consultations:"consulted",doctor:docId._id}).then(result=>{
        console.log(result);
        res.render('doctor-results',{result,bio});
      })
    } catch (error){
      console.log(error);
    }
  },
  logout:(req,res)=>{
    req.session.doctor=false
    console.log("Dr logouted");
    res.redirect('/doctor/doctorlogin');
  },
  docprofile:async(req,res)=>{
    const docId = req.session.doctor;
    const bio = await adddoctorsmodel.findOne({_id:docId});
    const doctor = req.params.id
    await adddoctorsmodel.findOne({_id:doctor}).then(el=>{
      res.render('doctorProfile',{bio,el})
    })
     
   
  },
  editdocProfile:async(req,res)=>{
    const docId = req.session.doctor;
    const bio = await adddoctorsmodel.findOne({_id:docId});
    const edId = req.params.id
    await adddoctorsmodel.findOne({_id:edId}).then(doc=>{
      res.render('editdocProfile',{doc,bio})
    }).catch(err=>{
      console.log(err);
    })
  },
  posteditdocPrfile:async(req,res)=>{
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
  },
  
 
  
};
