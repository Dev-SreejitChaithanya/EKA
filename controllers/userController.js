const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponsModel");
const Category = require("../models/categoryModel");
const Banner=require("../models/bannerModel")
const bcrypt = require("bcrypt");
const config = require("../config/config");
const nodemailer = require("nodemailer");

const res = require("express/lib/response");
const randomstring = require("randomstring");
const mongoose = require("mongoose");
const moment = require("moment");
const path = require("path")
const fs = require('fs');

const PDFDocument = require('pdfkit');


const { ObjectId } = require("mongodb");
let orderDa, dateO, Addr,orderDetails;
const loginLoad = async (req, res) => {
  try {
    if (req.session.user_id) {
      res.redirect("/home");
    } else {
      res.render("login", { login: true,nohead:true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "ekafurnitures@gmail.com",
        pass: "wyceyzxiltzcikft",
      },
    });
    const mailOptions = {
      from: "ekafurnitures@gmail.com",
      to: email,
      subject: "For reset password ",
      html:
        "<p>Hi " +
        name +
        ' ,please click here: <a href="https://www.ekafurnitures.online/forget-password?token=' +
        token +
        '">Reset </a> your password.</p>',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch && userData.block == false) {
        if (userData.is_verified === 0) {
          res.render("login",
            { message: "Please verify your mail and try" },
            { login: true }
          );
        } else {
          req.session.user_id = userData._id;

          res.redirect("/home");
        }
      } else {
        res.render("login", {
          message: "Email/password incorrect or you might be blocked ",
          login: true,
        });
      }
    } else {
      res.render("login", { message: "Email/password incorrect", login: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render("registration", { login: true });
  } catch (error) {
    console.log(error.message);
  }
};

const sendVerifyMail = async (name, email, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "ekafurnitures@gmail.com",
        pass: "wyceyzxiltzcikft",
      },
    });
    const mailOptions = {
      from: "ekafurnitures@gmail.com",
      to: email,
      subject: "Verification Mail",
      html:
        "<p>Hi " +
        name +
        ' ,please click here: <a href="https://www.ekafurnitures.online/verify?id=' +//"http://localhost:3000/
        user_id +
        '">Verify</a> your mail.</p>',
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    const checkUser = await User.findOne({ email: req.body.email });
    if (!checkUser) {
      if (req.body.password == req.body.cpassword) {
        const spassword = await securePassword(req.body.password); //password entered by the user is sent to the securePassword function
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile,
          password: spassword,
          is_admin: 0,
        });
        const userData = await user.save();

        if (userData) {
          sendVerifyMail(req.body.name, req.body.email, userData._id);

          res.render("login", {
            message: "Registration Successfull,Please verify your mail",
            login: true,
          });
        } else {
          res.render("registration", {
            message: "Registration Failed !!",
            login: true,
          });
        }
      } else {
        res.render("registration", {
          message: "Registration Failed !!",
          login: true,
        });
      }
    } else {
      res.render("registration", {
        message: "User exists already,try logging in!!",
        login: true,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const insertToCart = async (req, res) => {
  try {
    const addToCart = await User.updateOne(
      { _id: req.session.user_id },
      { $addToSet: { cart: { productId: req.body.id } } }
    ); //qty:req.body.quantity
    //     const userData=await User.find({_id: req.session.user_id, cart: { $ne: [] }}).lean();
    //     console.log(userData)

    //  if(!userData){const addToCart = await User.findByIdAndUpdate(
    //   { _id: req.session.user_id },
    //   { $addToSet: { cart: { productId:ObjectId(req.body.id),qty:parseInt(req.body.quantity) } }}
    // );
    // }
    //  else{const addToCart = await User.updateOne(
    //   { _id: req.session.user_id,'cart.productId':ObjectId(req.body.id)},
    //   { $inc: {'cart.$.qty':parseInt(req.body.quantity) } }
    // );
    // }

    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
  }
};

const userProfile = async (req, res) => {
  const userData = await User.find({ _id: req.session.user_id });
  res.render("userProfile", { user: userData, userSidebar: true });
};

const loadAddress = async (req, res) => {
  try {
    const user = await User.find({ _id: req.session.user_id });
    //     const userData=await User.find({_id: req.session.user_id, cart: { $ne: [] }}).lean();
    //     console.log(userData)

    //  if(!userData){const addToCart = await User.findByIdAndUpdate(
    //   { _id: req.session.user_id },
    //   { $addToSet: { cart: { productId:ObjectId(req.body.id),qty:parseInt(req.body.quantity) } }}
    // );
    // }
    //  else{const addToCart = await User.updateOne(
    //   { _id: req.session.user_id,'cart.productId':ObjectId(req.body.id)},
    //   { $inc: {'cart.$.qty':parseInt(req.body.quantity) } }
    // );
    // }

    res.render("address", { userdata: user, userSidebar: true });
  } catch (error) {
    console.log(error.message);
  }
};

const loadOrder = async (req, res) => {
  try {
    const order = await Order.find({ userId: req.session.user_id }).sort({
      date: -1,
    });
    //     const userData=await User.find({_id: req.session.user_id, cart: { $ne: [] }}).lean();
    //     console.log(userData)

    //  if(!userData){const addToCart = await User.findByIdAndUpdate(
    //   { _id: req.session.user_id },
    //   { $addToSet: { cart: { productId:ObjectId(req.body.id),qty:parseInt(req.body.quantity) } }}
    // );
    // }
    //  else{const addToCart = await User.updateOne(
    //   { _id: req.session.user_id,'cart.productId':ObjectId(req.body.id)},
    //   { $inc: {'cart.$.qty':parseInt(req.body.quantity) } }
    // );
    // }
    console.log("line number 251>>>>>>>>>");
    console.log(order);
    console.log("line number 253<<<<<<<<<");
    res.render("orders", { orderdata: order, userSidebar: true });
  } catch (error) {
    console.log(error.message);
  }
};
const addAddress = async (req, res) => {
  try {
    const userData = await User.find({ _id: req.session.user_id }).lean();
    res.render("addAddress", { user: userData, userSidebar: true });
    // const addAddress=await User.findByIdAndUpdate({_id:req.session.user_id},{$addToSet:{Address:{add:req.body.add,city:req.body.city,state:req.body.state,pin:req.body.pin}}});
    //     const userData=await User.find({_id: req.session.user_id, cart: { $ne: [] }}).lean();
    //     console.log(userData)

    //  if(!userData){const addToCart = await User.findByIdAndUpdate(
    //   { _id: req.session.user_id },
    //   { $addToSet: { cart: { productId:ObjectId(req.body.id),qty:parseInt(req.body.quantity) } }}
    // );
    // }
    //  else{const addToCart = await User.updateOne(
    //   { _id: req.session.user_id,'cart.productId':ObjectId(req.body.id)},
    //   { $inc: {'cart.$.qty':parseInt(req.body.quantity) } }
    // );
    // }
  } catch (error) {
    console.log(error.message);
  }
};

const removeCartItem = async (req, res) => {
  try {
    const removeFromCart = await User.findOneAndUpdate(
      { _id: req.session.user_id },
      { $pull: { cart: { productId: req.params.id } } }
    );

    res.json("success");
  } catch (error) {
    res.json("something went wrong");
    console.log(error.message);
  }
};

const loadHome = async (req, res) => {
  try {
    if(req.session.user_id)
    {
      const userData = await User.findById({ _id: req.session.user_id });
      const bannerData=await Banner.find().limit(2);
      const productData = await Product.find().limit(3);
      const allProdData = await Product.find()
      // res.render('home',{user:userData})
      res.render("home", { users: userData, products: productData, pData: allProdData, login: true ,banner:bannerData});
    }
    else{
      const bannerData=await Banner.find().limit(2);
      const productData = await Product.find().limit(3);
      const allProdData = await Product.find()
      // res.render('home',{user:userData})
      res.render("home", { products: productData, pData: allProdData, login: true ,banner:bannerData,nolog:true});
    }
   
  } catch (error) {
    console.log(error.message);
  }
};

const errorPage = async (req, res) => {
  try {
    res.render("errorPage",{login:true});
  } catch (error) {
    console.log(error.message);
  }
};

const loadShop = async (req, res) => {
  try {
if(req.session.user_id){    const userData = await User.findById({ _id: req.session.user_id });
const productData = await Product.find();
const categoryData = await Category.find({ deletedOn: null });

res.render("shop", {
  users: userData,
  products: productData,
  categorys: categoryData,
  login: true,
});}
else{
  const productData = await Product.find();
const categoryData = await Category.find({ deletedOn: null });

res.render("shop", {
  products: productData,
  categorys: categoryData,
  nolog:true,
  login: true,
});
}
  } catch (error) {
    console.log(error.message);
  }
};

const loadProductPage = async (req, res) => {
  try {
    const productData = await Product.find({ category: req.query.cname });
    console.log(productData,"new")
    if(productData.length !== 0)
    {if(req.session.user_id){res.render("productPage", { products: productData, login: true });}
    else{res.render("productPage", { products: productData, login: true,nolog:true });}}
    else
    {
      res.redirect("errorPage")     
    }
    
  } catch (error) {
    console.log(error.message);
  }
};

const loadCart = async (req, res) => {
  try {
    const cartData = await User.aggregate([
      { $match: { _id: ObjectId(req.session.user_id) } },
      {
        $lookup: {
          from: "products",
          let: { cartItems: "$cart" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$cartItems.productId"],
                },
              },
            },
          ],
          as: "Products",
        },
      },
    ]);

    const items = cartData[0].Products;
    let subtotal = 0;

    items.forEach((item) => {
      subtotal = subtotal + item.price;
    });

    res.render("showCart", {//res.render("showCart")
      product: items,
      CartExist: true,
      subtotal: subtotal,
      final: subtotal,
      offer: 0,
      login: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const insertAddress = async (req, res) => {
  try {
    if (req.body.cart) {
      const userData = await User.findByIdAndUpdate(
        { _id: req.session.user_id },
        {
          $addToSet: {
            Address: {
              name: req.body.name,
              mobile: req.body.mobile,
              add: req.body.add,
              city: req.body.city,
              state: req.body.state,
              pin: req.body.pin,
            },
          },
        }
      );
      res.json("success");
    } else {
      const userData = await User.findByIdAndUpdate(
        { _id: req.session.user_id },
        {
          $addToSet: {
            Address: {
              name: req.body.name,
              mobile: req.body.mobile,
              add: req.body.add,
              city: req.body.city,
              state: req.body.state,
              pin: req.body.pin,
            },
          },
        }
      );
      const user = await User.find({ _id: req.session.user_id });
      res.redirect("/showAddress");
      // res.render("address",{userdata:user,userSidebar:true});
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });
    const deleteAddress = await User.updateOne(
      {
        $and: [
          { _id: req.session.user_id },
          { Address: { $elemMatch: { _id: req.query.id } } },
        ],
      },
      {
        $pull: {
          Address: { _id: req.query.id },
        },
      }
    );
    res.redirect("/showAddress"); //maatam
  } catch (error) {
    console.log(error);
  }
};

const changeOrder = async (req, res) => {
  try {
    const Orderdetails = await Order.findById({ _id: req.body.OId })
    if(req.body.cancel){
    const deleteOrder = await Order.findByIdAndUpdate(
      { _id: req.body.OId },
      { $set: { status: "cancelled" } }
    );}
    else if(req.body.return){
      const deleteOrder = await Order.findByIdAndUpdate(
        { _id: req.body.OId },
        { $set: { status: "returned" } }
      );
      
    }
    if(Orderdetails.payment_method==2 || req.body.return){ const userData=await User.findByIdAndUpdate({_id:req.session.user_id},{$inc:{wallet:Orderdetails.paid_amount}})}
    //add here wallet code
    // if(deleteOrder.payment_method=="1")
    console.log("entered here");
    res.json("success");
  } catch (error) {
    console.log(error);
  }
};

const showProduct = async (req, res) => {
  try {
    if(req.session.user_id){const user=await User.find({_id:req.session.user_id});
    const productData = await Product.find({ _id: req.query.id });

    if (productData) { res.render("showProduct", { user:user,products: productData, login: true }); }
    else { res.redirect("errorPage") }}
    else{
      const productData = await Product.find({ _id: req.query.id });

    if (productData) { res.render("showProduct", { products: productData, login: true,nolog:true}); }
    else { res.redirect("/404") }
    }
    
  } catch (error) {
    res.redirect("errorPage")
    console.log(error.message);
  }
};

const forgotLoad = async (req, res) => {
  try {
    res.render("forgot", { login: true });
  } catch (error) {
    console.log(error.message);
  }
};

const forgotVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_verified === 0) {
        res.render("forgot", {
          message: "Please verify your email",
          login: true,
        });
      } else {
        const randomString = randomstring.generate();
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );
        sendResetPasswordMail(userData.name, userData.email, randomString);
        res.render("forgot", {
          message: "Please check your email to reset the password",
          login: true,
        });
      }
    } else {
      res.render("forgot", { message: "User email is incorrect", login: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_verified: 1 } }
    );
    console.log(updateInfo);
    res.render("email-verified",{login:true});
  } catch (error) {
    console.log(error.message);
  }
};

const forgotPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      res.render("forget-password", { user_id: tokenData._id,login:true });
    } else {
      res.render("404", { message: "Link already used",login:true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;
    const secure_password = await securePassword(password);
    const updatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: secure_password, token:'' } }
    );
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate(
      { _id: ObjectId(req.session.user_id) },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile,
        },
      }
    );

    // image: req.file.filename,
    res.redirect("/userProfile");
  } catch (error) {
    console.log(error.message);
  }
};

const checkOut = async (req, res) => {
  try {
    const address = await User.find({ _id: req.session.user_id }).lean();

    const cartData = await User.aggregate([
      { $match: { _id: ObjectId(req.session.user_id) } },
      {
        $lookup: {
          from: "products",
          let: { cartItems: "$cart" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$cartItems.productId"],
                },
              },
            },
          ],
          as: "Products",
        },
      },
    ]);
    let subtotal = 0;
    let offer = 0;
    const items = cartData[0].Products;
    items.map((item, i) => {
      item.quantity = req.body.quantity[i];
      subtotal = subtotal + item.price * req.body.quantity[i];
      tax = 0.1 * subtotal;
    });
    console.log(subtotal);
    res.render("checkOut", {
      productDetails: cartData[0].Products,
      subtotal: subtotal + tax,
      tax: tax,
      userAddress: address[0].Address,
      offer: offer,
      login: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const placeOrder = async (req, res) => {
  try {
    const {
      productid,
      productname,
      payment,
      price,
      quantity,
      addressId,
      total,
    } = req.body;
    console.log("inside placeorder line 595 userController");
 

    const result = Math.random().toString(36).substring(2, 7);
    const id = Math.floor(100000 + Math.random() * 900000);
    const orderId = result + id;
    const datetime = new Date().toISOString();
    const chathan = productid.map((item, i) => ({
      id: productid[i],
      name: productname[i],
      price: price[i],
      quantity: quantity[i],
    }));
    const invData = productid.map((item, i) => ({
      Sl_no: i,
      name: productname[i],
      quantity: quantity[i],
      price: price[i],
    }));

    let data = {
      userId: ObjectId(req.session.user_id),
      orderId: orderId,
      date: datetime,
      addressId: ObjectId(addressId),
      product: chathan,
      // status: "pending",
      payment_method: String(payment),
      paid_amount: total,
    };

    const orderPlacement = await Order.insertMany(data);
    const clearCart = await User.updateOne(
      {
        _id: req.session.user_id,
      },
      {
        $set: {
          cart: [],
        },
      }
    );

    quantity.map(async (item, i) => {
      const reduceStock = await Product.updateOne(
        { _id: ObjectId(productid[i]) },
        {
          $inc: {
            stock: -Number(item),
          },
        }
      );
    });

    //invoiceData

    const invoice_nr = orderId

    const address = await User.findById({ _id: req.session.user_id })
    const det = address.Address.filter((elem) => { if (elem._id == addressId) return elem })
    console.log("line 703 >>> address")
    console.log(address.Address)
    console.log("details")
    console.log(det)
    const invoice = {

      shipping: {
        name: det[0].name,
        address: det[0].add,
        city: det[0].city,
        state: det[0].state,
        country: 'India',
        postal_code: det[0].pin,
        mobile: det[0].mobile
      },
      items: invData,
      subtotal: total,
      invoice_nr: orderId,
    };
    console.log("Invoice Data >> line number 717")
    console.log(invoice)
    createInvoice(invoice);

    function createInvoice(invoice) {
      let doc = new PDFDocument({ margin: 50 });

      generateHeader(doc); // Invoke `generateHeader` function.
      generateCustomerInformation(doc, invoice);
      generateInvoiceTable(doc, invoice);

      doc.pipe(fs.createWriteStream(`./public/invoices/${orderId}.pdf`));
      doc.end();
    }



    function generateHeader(doc) {
      doc.image('logo.png', 30, 15, { width: 100 })
        .fillColor('#444444')
        .fontSize(15)
        .text('EKA Pvt. Ltd.', 200, 45, { align: 'right' })
        .fontSize(11)
        .text('Panthakkal Road', 150, 65, { align: 'right' })
        .text('Pattambi,Kerala,India 679303', 150, 80, { align: 'right' })
        .moveDown();
    }
    function generateCustomerInformation(doc, invoice) {
      doc
        .fillColor("#444444")
        .fontSize(20)
        .text("Invoice", 50, 160);

      generateHr(doc, 185);

      const customerInformationTop = 200;

      doc
        .fontSize(10)
        .text("Invoice Number:", 50, customerInformationTop)
        .font("Helvetica-Bold")
        .text(invoice.invoice_nr, 150, customerInformationTop)
        .font("Helvetica")
        .text("Invoice Date:", 50, customerInformationTop + 15)
        .text(formatDate(new Date()), 150, customerInformationTop + 15)

        .font("Helvetica-Bold")
        .text(invoice.shipping.name, 300, customerInformationTop)
        .font("Helvetica")
        .text(invoice.shipping.address, 300, customerInformationTop + 15)
        .text(
          invoice.shipping.city +
          ", " +
          invoice.shipping.state +
          ", " +
          invoice.shipping.country +
          "- " +
          invoice.shipping.postal_code,
          300,
          customerInformationTop + 30
        )
        .text(invoice.shipping.mobile, 300, customerInformationTop + 60)
        .moveDown();

      generateHr(doc, 252);
    }

    function generateInvoiceTable(doc, invoice) {
      let i;
      const invoiceTableTop = 330;

      doc.font("Helvetica-Bold");
      generateTableRow(
        doc,
        invoiceTableTop,
        "Sl.no",
        "Product Name",
        "Price",
        "Quantity",
        "Total"
      );
      generateHr(doc, invoiceTableTop + 20);
      doc.font("Helvetica");

      for (i = 0; i < invoice.items.length; i++) {
        const item = invoice.items[i];
        const position = invoiceTableTop + (i + 1) * 30;
        generateTableRow(
          doc,
          position,
          item.Sl_no,
          item.name,
          formatCurrency(item.price),
          item.quantity,
          formatCurrency(item.price * item.quantity)
        );

        generateHr(doc, position + 20);
      }

      const subtotalPosition = invoiceTableTop + (i + 1) * 30;
      generateTableRow(
        doc,
        subtotalPosition,
        "",
        "",
        "Subtotal",
        "",
        formatCurrency(invoice.subtotal)
      );

    }


    function generateTableRow(
      doc,
      y,
      item,
      description,
      unitCost,
      quantity,
      lineTotal
    ) {
      doc
        .fontSize(10)
        .text(item, 50, y)
        .text(description, 150, y)
        .text(unitCost, 280, y, { width: 90, align: "right" })
        .text(quantity, 370, y, { width: 90, align: "right" })
        .text(lineTotal, 0, y, { align: "right" });
    }

    function generateHr(doc, y) {
      doc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
    }

    function formatCurrency(cents) {
      return "Rs." + cents
    }

    function formatDate(date) {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      return year + "/" + month + "/" + day;
    }


    //invoiceData

    if (orderPlacement && clearCart) {

      res.json("success");
    } else {
      const handlePlacementissue = await Order.deleteMany({ orderId: orderId });
      res.json("try again");
    }
  } catch (error) {
    res.json("try again");
  }
};

const validateCoupon = async (req, res) => {
  try {
    const couponData = await Coupon.findOne({ code: req.body.code }).lean();
    const UserData = await Coupon.findOne({
      code: req.body.code,
      userId: req.session.user_id,
    }).lean();
    if (couponData && couponData.date > moment().format("YYYY-MM-DD")) {
      offerPrice = couponData.off;
      if (UserData) {
        res.json("fail");
      } else {
        const couponData = await Coupon.updateOne(
          { code: req.body.code },
          { $push: { userId: req.session.user_id } }
        );
        res.json(offerPrice);
      }
    } else {
      res.json("fail");
    }
  } catch (error) {
    console.log(error.message);
  }
};


const viewOrder = async (req, res) => {
  try {
    const viewOrder = await Order.findById({ _id: req.body.OId });
    orderDetails=viewOrder;
    const user = await User.findById({ _id: req.session.user_id });
    console.log("Address");
    console.log(req.body.OId);
    console.log("Address");
    console.log(viewOrder.addressId)
    const userAdd = await User.aggregate([
      { $match: { _id: ObjectId(req.session.user_id) } },
      { $unwind: "$Address" },
      { $match: { "Address._id": viewOrder.addressId } },
    ]);
    Addr = userAdd[0].Address;
    orderDa = viewOrder.product;
    dateO = moment(viewOrder.date).format("MM-DD-YYYY");
    console.log(dateO);
    console.log(userAdd)
    console.log(Addr);
    console.log(viewOrder.addressId);
    res.json("success");
  } catch (error) {
    console.log(error);
  }
};
const showOrder = async (req, res) => {
  try {
    res.render("viewOrderDetails", {
      orderD: orderDa,
      Date: dateO,
      Add: Addr,
      Detail:orderDetails,
      userSidebar: true,
    });
  } catch (error) {
    console.log(error);
  }
};
const loadWallet=async(req,res)=>
{
try{
  const userData=await User.findById({_id:req.session.user_id})
  const walletBalance = userData.wallet
  res.render("wallet",{wallet: walletBalance,user: userData, userSidebar: true})
}
catch(error)
{console.log(error)}};
module.exports = {
  loginLoad,
  verifyLogin,
  loadRegister,
  insertUser,
  loadHome,
  logout,
  forgotLoad,
  forgotVerify,
  verifyMail,
  forgotPasswordLoad,
  resetPassword,
  loadShop,
  loadProductPage,
  showProduct,
  insertToCart,
  loadCart,
  removeCartItem,
  loadAddress,
  userProfile,
  updateProfile,
  addAddress,
  insertAddress,
  deleteAddress,
  checkOut,
  placeOrder,
  loadOrder,
  changeOrder,
  validateCoupon,
  viewOrder,
  showOrder,
  errorPage,
  loadWallet
  //createInvoices
  //downloadOrder
};
