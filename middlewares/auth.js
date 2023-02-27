
const isLogin=async(req,res,next)=>{
    try{
        if(req.session.user_id ){}
        else{res.redirect('/login');}
        next();
    }
    catch(error){console.log(error.message);}
}
const isLogout=async(req,res,next)=>{
    try{
        if(req.session.user_id ){res.redirect('/home')}
        next();
    }
    catch(error){console.log(error.message);}
}

const isLogoutAdmin=async(req,res,next)=>{
    try{
        if(req.session.admin_id){res.redirect('/admin/dashboard')}
        next();
    }
    catch(error){console.log(error.message);}
}

const isLoginAdmin=async(req,res,next)=>{
    try{
        if(req.session.admin_id ){}
        else{res.redirect('/admin');}
        next();
    }
    catch(error){console.log(error.message);}
}

module.exports={isLogin,isLogout,isLogoutAdmin,isLoginAdmin}