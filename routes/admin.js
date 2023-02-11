const express = require('express');
const { getadminhome,
        adminLogin,
        adminpost,
        doctorget, 
        userget,
        appointmentget,
        adddoctorget,
        adddoctorpost,
        blockget,
        unblockget,
        editdoctorget,
        posteditdoctor,
        deletedoctorsget,
        deletepatientget,
        activedocget,
        nonactivedocget,
        patientsget,
        Logout} = require('../controllers/adminControllers');
const router = express.Router();

 

//Get adminpanel

router.get('/',getadminhome);
router.get('/adminlogin',adminLogin);
router.post('/adminlogin',adminpost);
router.get('/admindoctor',doctorget);
router.get('/adminuserlist',userget);
router.get('/adminappointment',appointmentget);
router.get('/adddoctors',adddoctorget);
router.get('/adminpatients',patientsget);
router.post('/adddoctors',adddoctorpost);
router.get('/blockuser/:id',blockget);
router.get('/unblockuser/:id',unblockget);
router.get('/doctorsedit/:id',editdoctorget);
router.post('/doctorsedit/:id',posteditdoctor);
router.get('/deletedoctors/:id',deletedoctorsget);
router.get('/deletepatient/:id',deletepatientget);
router.get('/activedoctor/:id',activedocget);
router.get('/nonactivedoctor/:id',nonactivedocget);
router.get('/logout',Logout);

module.exports = router