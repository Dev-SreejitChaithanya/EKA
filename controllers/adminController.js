const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Category = require("../models/categoryModel");
const Coupon = require("../models/couponsModel");
const Banner = require("../models/bannerModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const res = require("express/lib/response");
const session = require("express-session");
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const adminLogin = async (req, res) => {
  try {
    res.render("adminlogin", { admin: true, sidebar: false, login: true });
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render("adminregistration", { admin: true, sidebar: false });
  } catch (error) {
    console.log(error.message);
  }
};

const insertAdmin = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);

    const admin = new Admin({
      name: req.body.name,
      email: req.body.email,
      password: spassword,
    });

    const adminData = await admin.save();
    if (adminData) {
      res.render("adminregistration", { message: "Registration Successfull" });
    } else {
      res.render("adminregistration", { message: "Registration Failed !!" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyAdmin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const adminData = await Admin.findOne({ email: email });

    if (adminData) {
      const passwordMatch = await bcrypt.compare(password, adminData.password);
      if (passwordMatch) {
        req.session.admin_id = adminData._id;
        res.redirect("/admin/dashboard");
      } else {
      }
    } else {
      res.render("adminlogin", { message: "Email/password incorrect" });
    }
  } catch (error) {}
};

const loadDashboard = async (req, res) => {
  try {
    const users = await User.find({}).count();
    const products = await Product.find({}).count();
    const orders = await Order.find({}).count();
    const COD = await Order.find({ payment_method: "1" }).count();
    const salesData = await Order.aggregate([
      {
        $group: {
          /*_id: { $dateToString: { format: "%m", date: "$date" } },*/
          _id: { $month: "$date" },
          totalSales: { $sum: "$paid_amount" },
        },
      },
    ]);
    console.log(salesData);
    const Online = orders - COD;
    res.render("adminDashboard", {
      admin: true,
      sidebar: true,
      userCount: users,
      prodCount: products,
      ordCount: orders,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadProducts = async (req, res) => {
  try {
    const productData = await Product.find();
    const categoryData = await Category.find();

    res.render("products", {
      admin: true,
      sidebar: true,
      products: productData,
      categorys: categoryData,
    });
  } catch (error) {
    console.log(error);
  }
};

const loadCoupons = async (req, res) => {
  try {
    const couponData = await Coupon.find();

    res.render("coupons", {
      admin: true,
      sidebar: true,
      coupons: couponData,
    });
  } catch (error) {
    console.log(error);
  }
};

const loadOrder = async (req, res) => {
  try {
    const orderData = await Order.find({}).sort({ date: -1 }).lean();
    console.log(orderData + "************************");

    res.render("orders", {
      admin: true,
      sidebar: true,
      orders: orderData,
    });
  } catch (error) {
    console.log(error);
  }
};

const loadCategory = async (req, res) => {
  try {
    const categoryData = await Category.find();

    res.render("category", {
      admin: true,
      sidebar: true,
      categorys: categoryData,
    });
  } catch (error) {
    console.log(error);
  }
};

const addProduct = async (req, res) => {
  try {
    const categoryData = await Category.find({ deletedOn: null });
    res.render("addProduct", {
      admin: true,
      sidebar: true,
      categorys: categoryData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const addBanner = async (req, res) => {
  try {
    const bannerData = await Banner.find({});
    res.render("addBanner", {
      admin: true,
      sidebar: true,
      banners: bannerData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const addCategory = async (req, res) => {
  try {
    const categoryData = await Category.find({});
    res.render("addCategory", { admin: true, sidebar: true });
  } catch (error) {
    console.log(error.message);
  }
};

const insertProduct = async (req, res) => {
  try {
    const categoryData = await Category.find({});
    const product = new Product({
      image: req.file.filename,
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
    });

    const productData = await product.save();
    if (productData) {
      res.render("addProduct", {
        admin: true,
        sidebar: true,
        categorys: categoryData,
      });
    } else {
      res.render("addProduct", {
        admin: true,
        sidebar: true,
        categorys: categoryData,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const insertBanner = async (req, res) => {
  try {
    const banner = new Banner({
      image: req.file.filename,
      heading: req.body.heading,
      description: req.body.description,
    });

    const bannerData = await banner.save();
    if (bannerData) {
      res.render("addBanner", { admin: true, sidebar: true });
    } else {
      res.render("addBanner", { admin: true, sidebar: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const insertCategory = async (req, res) => {
  try {
    const checkCategory = await Category.findOne({ name: req.body.name });
    if (!checkCategory) {
      const category = new Category({
        image: req.file.filename,
        name: req.body.name,
      });

      const categoryData = await category.save();
      if (categoryData) {
        res.render("addCategory", { admin: true, sidebar: true });
      } else {
        res.render("addCategory", { message: "Registration Failed !!" });
      }
    } else {
      res.render("addCategory", { admin: true, sidebar: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadUser = async (req, res) => {
  try {
    const userData = await User.find({});
    res.render("users", { admin: true, sidebar: true, users: userData });
  } catch (error) {
    console.log(error);
  }
};

const loadBanner = async (req, res) => {
  try {
    const bannerData = await Banner.find({});
    res.render("banner", { admin: true, sidebar: true, banners: bannerData });
  } catch (error) {
    console.log(error);
  }
};

const editProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findById({ _id: id });
    const categoryData = await Category.find({});

    if (productData) {
      res.render("editProduct", {
        admin: true,
        sidebar: true,
        products: productData,
        categorys: categoryData,
      });
    } else {
      res.redirect("/admin/dashboard");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editBanner = async (req, res) => {
  try {
    const id = req.query.id;
    const bannerData = await Banner.findById({ _id: id });

    if (bannerData) {
      res.render("editBanner", {
        admin: true,
        sidebar: true,
        banners: bannerData,
      });
    } else {
      res.redirect("/admin/dashboard");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateProduct = async (req, res) => {
  try {
    const imgcheck = req.body.id;
    if (req.body.file) {
      const productData = await Product.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            stock: req.body.stock,
          },
          $push: { image: req.file.filename },
        }
      );
    } else {
      const productData = await Product.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            stock: req.body.stock,
          },
        }
      );
    }

    // image: req.file.filename,
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};
const updateBanner = async (req, res) => {
  try {
    const bannerData = await Banner.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          image: req.file.filename,
          heading: req.body.heading,
          description: req.body.description,
        },
      }
    );

    // image: req.file.filename,
    res.redirect("/admin/banner");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productData = await Product.findByIdAndUpdate(
      { _id: req.query.id },
      { $set: { deletedOn: Date(Date.now()) } }
    );

    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};

const undeleteProduct = async (req, res) => {
  try {
    const productData = await Product.findByIdAndUpdate(
      { _id: req.query.id },
      { $set: { deletedOn: "" } }
    );

    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryData = await Category.findByIdAndUpdate(
      { _id: req.query.id },
      { $set: { deletedOn: Date(Date.now()) } }
    );

    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

const undeleteCategory = async (req, res) => {
  try {
    const categoryData = await Category.findByIdAndUpdate(
      { _id: req.query.id },
      { $set: { deletedOn: null } }
    );

    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

const blockUser = async (req, res) => {
  try {
    const userData = await User.findOneAndUpdate(
      { _id: req.query.id },
      { $set: { block: true } }
    );
    res.redirect("users");
  } catch (error) {
    console.log(error.message);
  }
};

const unblockUser = async (req, res) => {
  try {
    const userData = await User.findOneAndUpdate(
      { _id: req.query.id },
      { $set: { block: false } }
    );
    res.redirect("users");
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

const insertCoupon = async (req, res) => {
  try {
    const coupon = new Coupon({
      code: req.body.code,
      off: req.body.off,
      date: req.body.date,
      status: "active",
    });

    const couponData = await coupon.save();
    if (couponData) {
      res.json("success");
    } else {
      res.json("failure");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteOrder = async (req, res) => {
  try {
    console.log("entered here");
    const option = req.body.todo;
    if (option == "cancel") {
      const deleteOrder = await Order.findOneAndUpdate(
        { _id: req.body.OId, product: { $elemMatch: { _id: req.body.OpId } } },
        { $set: { status: "cancelled" } }
      );
      res.json("success");
    } else if (option == "ship") {
      const deleteOrder = await Order.findOneAndUpdate(
        { _id: req.body.OId, product: { $elemMatch: { _id: req.body.OpId } } },
        { $set: { status: "shipped" } }
      );
      res.json("success");
    } else if (option == "deliver") {
      const deleteOrder = await Order.findOneAndUpdate(
        { _id: req.body.OId, product: { $elemMatch: { _id: req.body.OpId } } },
        { $set: { status: "delivered" } }
      );
      res.json("success");
    }
  } catch (error) {
    console.log(error);
  }
};

const reportDownload = async (req, res) => {
  try {
    const orderData = await Order.find({}).sort({ date: -1 });
    res.render("allOrders", { orders: orderData, admin: true, sidebar: true });
  } catch (error) {
    console.log(error);
  }
};

const chartData = async (req, res) => {
  try {
    const orders = await Order.find({}).count();
    const COD = await Order.find({ payment_method: "1" }).count();
    const Online=orders-COD;
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%m", date: "$date" } },
          totalSales: { $sum: "$paid_amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({salesData,COD,Online});
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  adminLogin,
  loadRegister,
  insertAdmin,
  loadDashboard,
  verifyAdmin,
  loadProducts,
  loadUser,
  loadBanner,
  insertProduct,
  addProduct,
  addBanner,
  editProduct,
  updateProduct,
  deleteProduct,
  blockUser,
  unblockUser,
  logout,
  loadCategory,
  addCategory,
  insertCategory,
  insertBanner,
  deleteCategory,
  undeleteProduct,
  undeleteCategory,
  updateBanner,
  editBanner,
  loadOrder,
  loadCoupons,
  insertCoupon,
  deleteOrder,
  reportDownload,
  chartData,
};
