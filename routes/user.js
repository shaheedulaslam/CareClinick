const express = require('express');
const router = express.Router();
const {author} = require('../middlewares/auth');
const { getHome,
        getlogin,
        postLogin,
        getsignup,
        postSignup,
        getappointment,
        Logout,
        postappointment,
        getpayment,
        postpayment,
        verifyPayment,
        success,
        getappointlists,
        postOtpverify,
        getverify,
        profile,
        editprofile,
        postprofile,
        about,
        contactus,
        contactUspost,
        selectedAppoint,
        forgetPassword,
        postforgetPassword,
        resetPassword,
        postresetPassword,
        getReports,
        ERROR} = require('../controllers/UserControllers');




//  get home page

router.get('/', getHome);
router.get('/login', getlogin);
router.post('/login', postLogin);
router.get('/signup', getsignup);
router.post('/signup', postSignup);
router.get('/appointment',author,getappointment);
router.get('/logout',Logout);
router.post('/appointment', postappointment);
router.get('/payment/:id/:dr',getpayment);
router.put('/payment',postpayment);
router.put('/verify-payment',verifyPayment);
router.get('/success', success);
router.get('/appointlists',getappointlists);
router.post('/otpverify',postOtpverify);
router.get('/verify',getverify);
router.get('/profile/:id',profile);
router.get('/editprofile/:id',editprofile);
router.post('/editprofile/:id',postprofile);
router.get('/about',about);
router.get('/contactus',contactus);
router.post('/contactUs',contactUspost);
router.post('/selected',selectedAppoint);
router.get('/forgetpassword',forgetPassword);
router.post('/forgetpassword',postforgetPassword);
router.get('/resetPassword/:id',resetPassword);
router.post('/resetPassword',postresetPassword);
router.get('/medical-Reports',getReports);
router.get('/404error',ERROR);

module.exports = router