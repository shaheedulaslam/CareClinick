const bcrypt = require("bcrypt");
const appointmodel = require("../models/appointment");
const adddoctorsmodel = require("../models/doctors");
const Usermodel = require("../models/user");
const adminmodel = require('../models/adminProfile');

module.exports = {
  getadminhome: async (req, res) => {
    try {
      if (req.session.admin) {
        const adminId = req.session.admin;
        const admin =  await adminmodel.findOne({_id:adminId})
        const appointcount = await appointmodel.count();
        const patcount = await appointmodel.count();
        const doccount = await adddoctorsmodel.count();
        const msg = appointcount + doccount;
        console.log(doccount + " " + "doctors are in our Clinic..");
        console.log(patcount + " " + "patients are in our Clinic..");
        console.log(appointcount + " " + "appointments already there !");
        adddoctorsmodel
          .find()
          .then((doctorslists) => {
            res.render("adminpanel", {
              doctorslists,
              doccount,
              patcount,
              appointcount,
              msg,
              admin
            });
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        res.redirect("/admin/adminlogin");
      }
    } catch (error) {
      console.log(error);
    }
  },
  adminLogin: (req, res) => {
    try {
      if (req.session.admin) {
        res.redirect("/admin");
      } else {
        let errmessage = req.session.adminlog;
        req.session.adminlog = null;
        res.render("adminlogin", { user: false, admin: false,errmessage});
        errmessage = null
      }
    } catch (error) {
      console.log(error);
    }
  },
  adminpost: async(req, res) => {

    try {
      const reqmail = req.body.email;
      const reqpass = req.body.password;
      const admindtls = await adminmodel.find({email:reqmail,password:reqpass})
      if(admindtls){
        req.session.admin = admindtls
        res.redirect('/admin')
      }else{
        req.session.adminlog = null
        res.redirect('/admin/adminlogin')
      }
    } catch (error) {
      console.log(error);
    }
    // try {
    //   const reqmail = req.body.email;
    //   const reqpass = req.body.password;
    //   const email = process.env.adminEmail;
    //   const pass = process.env.adminPass;

    //   if (email == reqmail && pass == reqpass) {
    //     req.session.admin = true;
    //     res.redirect("/admin");
    //   } else {
    //     req.session.adminlog = true;
    //     res.redirect("/admin/adminlogin");
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
  },
  userget:async(req, res) => {
    const adminId = req.session.admin;
    const admin =  await adminmodel.findOne({_id:adminId})
    Usermodel.find()
      .then((userlists) => {
        res.render("adminuserlist", { userlists,admin});
      })
      .catch((err) => {
        console.log(err);
      });
  },
  patientsget:async (req, res) => {
    try {
      const adminId = req.session.admin;
      const admin =  await adminmodel.findOne({_id:adminId})
      appointmodel
        .find()
        .then((patientlist) => {
          res.render("adminpatients", { patientlist,admin });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
  },
  appointmentget: async (req, res) => {
    const adminId = req.session.admin;
    const admin =  await adminmodel.findOne({_id:adminId})
   const docname =  await adddoctorsmodel.find()
      appointmodel.find().then((adminappointlist) => {
          res.render("adminappointment", { adminappointlist, docname,admin });
        }).catch((err) => {
        console.log(err);
      });
  },
  adddoctorget:async (req, res) => {
    const adminId = req.session.admin;
    const admin =  await adminmodel.findOne({_id:adminId})
    res.render("adddoctors",{admin});
  },
  adddoctorpost: (req, res) => {
    try {
      console.log(req.body);
      const adddoctorForm = new adddoctorsmodel({
        name: req.body.name,
        email:req.body.email,
        password:req.body.password,
        speciality: req.body.speciality,
        qualification: req.body.qualification,
        image: req.file.filename,
        earned: req.body.earned,
      });
      console.log(req.file, "haaaaa");
      adddoctorForm
        .save()
        .then((result) => {
          console.log(result);
          console.log("doctor added");
          res.redirect("/admin/admindoctor");
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  },
  doctorget:async(req, res) => {
    const adminId = req.session.admin;
    const admin =  await adminmodel.findOne({_id:adminId})
      adddoctorsmodel.find().then((doctorslist) => {
          res.render("admindoctor", { doctorslist,admin });
        })
        .catch((err) => {
          console.log(err);
        });
  },
  blockget: async (req, res) => {
    try {
      const id = req.params.id;
      console.log(id);
      await Usermodel.findByIdAndUpdate(id, { access: false });
      res.redirect("/admin/adminuserlist");
    } catch (error) {
      console.log(error);
    }
  },
  unblockget: async (req, res) => {
    try {
      const id1 = req.params.id;
      console.log(id1);
      await Usermodel.findByIdAndUpdate(id1, { access: true });
      res.redirect("/admin/adminuserlist");
    } catch (error) {
      console.log(error);
    }
  },
  editdoctorget: async (req, res) => {
    const adminId = req.session.admin;
    const admin =  await adminmodel.findOne({_id:adminId})
    let edId = req.params.id;
    console.log(edId);
    adddoctorsmodel.findOne({ _id: edId }).then((editdoc) => {
        res.render("doctorsedit", { editdoc,admin });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  posteditdoctor: async (req, res) => {
    const edId1 = req.params.id;
    const name = req.body.name;
    const speciality = req.body.speciality;
    const qualification = req.body.qualification;
    const earned = req.body.earned;
    const image = req.file.filename;

    console.log(req.file, "image");
    await adddoctorsmodel.updateOne({ _id: edId1 },
        {
          $set: {
            name: name,
            speciality: speciality,
            qualification: qualification,
            earned: earned,
            image: image,
          },
        }
      )
      .then((result) => {
        console.log(result, "updated");
        res.redirect("/admin");
      })
      .catch((error) => {
        console.log(error);
      });
  },
  deletedoctorsget: (req, res) => {
    let docId = req.params.id;
    console.log(docId);
    adddoctorsmodel
      .deleteOne({ _id: docId })
      .then((result) => {
        console.log(result + "doctor deleted");
        res.redirect("/admin");
      })
      .catch((err) => {
        console.log(err);
      });
  },
  deletepatientget: (req, res) => {
    let patieId = req.params.id;
    console.log(patieId);
    appointmodel
      .deleteOne({ _id: patieId })
      .then((result) => {
        console.log(result);
        res.redirect("/admin/adminpatients");
      })
      .catch((err) => {
        console.log(err);
      });
  },
  activedocget: async (req, res) => {
    try {
      const docAc = req.params.id;
      console.log(docAc);
      await adddoctorsmodel.findByIdAndUpdate(docAc, { access: true });
      res.redirect("/admin/admindoctor");
    } catch (error) {
      console.log(error);
    }
  },
  nonactivedocget: async (req, res) => {
    try {
      const docNon = req.params.id;
      console.log(docNon);
      await adddoctorsmodel.findByIdAndUpdate(docNon, { access: false });
      res.redirect("/admin/admindoctor");
    } catch (error) {
      console.log(error);
    }
  },
  Logout: (req, res) => {
    req.session.admin = false;
    console.log("logout ayyi");
    res.redirect("/admin/adminlogin");
  },

};
