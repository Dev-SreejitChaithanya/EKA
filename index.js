const express=require('express')
const app=express();
const Handlebars = require('handlebars');
const config=require('./config/config')
const H = require('just-handlebars-helpers');
const moment=require("moment")
H.registerHelpers(Handlebars);
Handlebars.registerHelper("multiplyThings", function(thing1, thing2) {
    return thing1 * thing2;
  });
  H.registerHelpers(Handlebars);
Handlebars.registerHelper("moment", function(thing1, thing2) {
    return moment(thing1).format(thing2);
  });
const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: "rzp_test_ASawQP7nVsBtie", key_secret: "deoMVE2Sbd9cmycWprZ6ltac" })
const mongoose= require("mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/EKA');//mongoose.connect('mongodb://127.0.0.1:27017/DBname')



const hbs=require('express-handlebars')
const path=require('path')
const bodyParser=require('body-parser')

const userRoutes=require( './routes/userRoutes');
const adminRoutes=require( './routes/adminRoutes');
const session=require("express-session")

const nocache = require("nocache");


app.use(express.static(__dirname+'/public'));

app.set('views',path.join(__dirname,'views'))
app.set('view engine','hbs');

app.engine('hbs',hbs.engine({

    extname:'hbs',
    defaultLayout:'layouts',
    runtimeOptions: {
        allowProtoPropertiesByDefault:true,
        allowProtoMethodsByDefault: true,
            },
    layoutsDir:__dirname+'/views/layouts/',
    partialsDir:__dirname+'/views/partials'

}))

//session 
app.use(session({
    secret:"se1c2r3etKEY",
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:360000,
        sameSite:false,
    }
}))

//cache
//app.use(function(req, res, next) {
//     res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
//     res.setHeader('Pragma', 'no-cache');
//     res.setHeader('Expires', '0');
        
//     next();
//   });


//cache
app.use(nocache());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use('/admin',adminRoutes);
app.use('/',userRoutes);


app.listen(3000,(req,res)=>{console.log("server started running.....")})
