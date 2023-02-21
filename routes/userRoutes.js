const express = require("express");
const user_route = express();

const Razorpay = require('razorpay');
const config=require('../config/config')
var instance = new Razorpay({ key_id: config.keyId, key_secret: config.keySecret })
user_route.set("views", "./views/user");
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");

user_route.get("/", auth.isLogout, userController.loginLoad);
user_route.post("/", userController.verifyLogin);

user_route.get("/register", auth.isLogout, userController.loadRegister);
user_route.post("/register", userController.insertUser);


user_route.get("/home", auth.isLogin, userController.loadHome);
user_route.get("/shop", auth.isLogin, userController.loadShop);
user_route.get("/logout", auth.isLogin, userController.logout);
user_route.get("/cart", auth.isLogin, userController.loadCart);
user_route.delete("/removeCartItem/:id",auth.isLogin, userController.removeCartItem);

user_route.get("/forgot", auth.isLogout, userController.forgotLoad);
user_route.post("/forgot", auth.isLogout, userController.forgotVerify);

user_route.get('/verify',userController.verifyMail);

user_route.get('/forget-password',auth.isLogout,userController.forgotPasswordLoad);
user_route.post('/forget-password',userController.resetPassword);

user_route.get("/loadProducts", auth.isLogin, userController.loadProductPage);
user_route.get("/showProduct", auth.isLogin, userController.showProduct);

user_route.get("/errorPage", auth.isLogin, userController.errorPage);
user_route.post("/showProduct", auth.isLogin, userController.insertToCart);

user_route.get("/userProfile", auth.isLogin, userController.userProfile);
user_route.post("/userProfile", auth.isLogin, userController.updateProfile);

// user_route.get("/address", auth.isLogin, userController.userProfile);
user_route.get("/orders", auth.isLogin, userController.loadOrder);



user_route.get("/showAddress", auth.isLogin, userController.loadAddress);
user_route.get("/addAddress", auth.isLogin, userController.addAddress);//ivdinn cheyyanm ,add button click cheytha ith work aVM

user_route.post("/addAddress", auth.isLogin, userController.insertAddress);
user_route.get("/deleteAddress", auth.isLogin, userController.deleteAddress);

user_route.post("/validateCoupon", auth.isLogin, userController.validateCoupon);


user_route.post("/proceed-checkout", auth.isLogin, userController.checkOut);
user_route.post("/placeOrder", auth.isLogin, userController.placeOrder);//,userController.createInvoice
user_route.post("/cancelOrder", auth.isLogin, userController.deleteOrder);
user_route.post("/viewOrder", auth.isLogin, userController.viewOrder);
user_route.get("/showOrder", auth.isLogin, userController.showOrder);

// user_route.post("/getOrderData", auth.isLogin, userController.downloadOrder);

//razorpay  check
user_route.post('/create/orderId',(req,res)=>{
    console.log("Create OrderId Request",req.body)
    var options = {
      amount: req.body.amount,  // amount in the smallest currency unit
      currency: "INR",
      receipt: "rcp1"
    };
    instance.orders.create(options, function(err, order) {
      console.log(order);
      res.send({orderId:order.id});//EXTRACT5NG ORDER ID AND SENDING IT TO CHECKOUT
    });
}); 

//verify payment:
user_route.post("/api/payment/verify",(req,res)=>{

    let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
   
     var crypto = require("crypto");
     var expectedSignature = crypto.createHmac('sha256', 'deoMVE2Sbd9cmycWprZ6ltac')
                                     .update(body.toString())
                                     .digest('hex');
                                     console.log("sig received" ,req.body.response.razorpay_signature);
                                     console.log("sig generated" ,expectedSignature);
     var response = {"signatureIsValid":"false"}
     if(expectedSignature === req.body.response.razorpay_signature)
      response={"signatureIsValid":"true"}
         res.send(response);
     });

module.exports = user_route;
