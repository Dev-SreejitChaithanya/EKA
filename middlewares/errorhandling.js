

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    next(error);
  };
  
  const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; //admin: true,
    sidebar: true
    if(req.session.admin_id){res.render("user/errorPage",{login:true,showAdmin:true});}
    
    else{res.render("user/errorPage",{login:true});}
  };
  
  module.exports = { notFound, errorHandler };