require("dotenv").config()

const sessionSecret =process.env.sessionSecret;
const emailUser = process.env.emailUser;
const emailPassword=process.env.emailPassword;
const keyId=process.env.keyId;
const keySecret=process.env.keySecret;
module.exports={sessionSecret,emailPassword,emailUser,keyId,keySecret}