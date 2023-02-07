// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').config();
// }

require("dotenv").config();

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const path = require('path');
const flash = require('express-flash')
const session = require('express-session')
const multer = require('multer');


const fileStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/images');
    },
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+'-'+Date.now()+
        path.extname(file.originalname));
    }
});
const fileFilter = (req,file,cb)=>{
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null,true);
    }else{
        cb(null,false);
    }  
};


const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')
const doctorRouter = require('./routes/doctor')


app.set('view engine', 'ejs')
app.set("views", path.join(__dirname, 'views'));
app.set('layout', 'layouts/layout')
app.use(expressLayouts);
app.use(express.static('public'));
app.use(session({ secret: "ABCD", cookie: { maxAge: 600000000 } }))
//cache clearing... 
app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
next();
});

// app.use(express.urlencoded({extended:false}));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
app.use(multer({storage:fileStorage,fileFilter:fileFilter }).single('image'))



const mongoose = require('mongoose')
const User = require('./models/user')
// mongoose.connect(process.env.DATABASE_URL,{
//     useNewUrlParser: true })
mongoose.connect('mongodb://127.0.0.1:27017/ClinicManagement')
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to mongooose'))

app.use('/', userRouter)
app.use('/admin', adminRouter)
app.use('/doctor', doctorRouter)


app.listen(process.env.PORT || 3000)