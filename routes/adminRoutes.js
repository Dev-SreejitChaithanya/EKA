const express = require('express');
const admin_route=express();
const session=require("express-session");
const config=require('../config/config')
const upload=require('../middlewares/fileupload');
const auth=require('../middlewares/auth')
const adminController = require('../controllers/adminController')

admin_route.set('views','./views/admin');

admin_route.get('/',auth.isLogoutAdmin,adminController.adminLogin);
admin_route.post('/',adminController.verifyAdmin);



admin_route.get('/register',auth.isLogoutAdmin,adminController.loadRegister);
admin_route.post('/register',adminController.insertAdmin);

admin_route.get('/dashboard',auth.isLoginAdmin,adminController.loadDashboard);
admin_route.get('/products',auth.isLoginAdmin,adminController.loadProducts)
admin_route.get('/users',auth.isLoginAdmin,adminController.loadUser)
admin_route.get('/banner',adminController.loadBanner)
admin_route.get('/orders',adminController.loadOrder)
admin_route.get('/coupons',adminController.loadCoupons)
admin_route.post('/addCoupon',adminController.insertCoupon)



admin_route.get('/addproduct',adminController.addProduct)
admin_route.post('/addproduct',upload.single('image'),adminController.insertProduct)
admin_route.get('/addBanner',adminController.addBanner)
admin_route.post('/addBanner',upload.single('image'),adminController.insertBanner)

admin_route.get('/editProduct',adminController.editProduct)
admin_route.post('/editProduct',upload.single('image'),adminController.updateProduct)
admin_route.get('/editBanner',adminController.editBanner)
admin_route.post('/editBanner',upload.single('image'),adminController.updateBanner)



admin_route.get('/deleteProduct',adminController.deleteProduct)
admin_route.get('/undeleteProduct',adminController.undeleteProduct)

admin_route.get('/deleteCategory',adminController.deleteCategory)
admin_route.get('/undeleteCategory',adminController.undeleteCategory)

admin_route.get('/blockUser',adminController.blockUser)
admin_route.get('/unblockUser',adminController.unblockUser)
admin_route.get('/logout',auth.isLoginAdmin,adminController.logout)

admin_route.get('/category',auth.isLoginAdmin,adminController.loadCategory)
admin_route.get('/addCategory',adminController.addCategory)
admin_route.post('/addCategory',upload.single('image'),adminController.insertCategory)

admin_route.post('/cancelOrder',auth.isLoginAdmin,adminController.deleteOrder);
admin_route.get('/ordersDownload',adminController.reportDownload)

admin_route.get('/chartData',adminController.chartData)





module.exports=admin_route