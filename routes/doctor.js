const express = require('express');
const { doctorLogin,
        doctorpost,
        getdoctorhome,
        getdocbookings,
        getmypatients,
        getresults,
        deletebook,
        getupcoming,
        getconsulted,
        getacceptbook,
        getconsultreciept,
        consultedresult,
        logout,
        docprofile,
        editdocProfile,
        posteditdocPrfile} = require('../controllers/doctorControllers');
const router = express.Router();

//get doctor panel

router.get('/',getdoctorhome);
router.get('/doctorlogin',doctorLogin);
router.post('/doctorlogin',doctorpost);
router.get('/doctorbookings',getdocbookings);
router.get('/doctormypatients',getmypatients);
router.get('/doctor-results',getresults);
router.get('/deletebook/:id',deletebook);
router.get('/acceptbookings/:id',getacceptbook);
router.get('/doc-upcomingappoint',getupcoming);
router.get('/doctorconsulted',getconsulted);
router.get('/consultreciept/:id',getconsultreciept);
router.post('/consultedresult/:id',consultedresult);
router.get ('/logout',logout);
router.get('/doctorProfile/:id',docprofile);
router.get('/editdocProfile/:id',editdocProfile);
router.post('/editdocProfile/:id',posteditdocPrfile)






module.exports = router