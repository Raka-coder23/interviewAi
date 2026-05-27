const jwt= require('jsonwebtoken')
const tokenBlacklistModel=require('../model/blacklist.model')
 async function authuser(req,res,next){
  const token=req.cookies.token
  if(!token){
     return res.status(400).json({
      message:"token not provided"
    })
  }
   const isTokenBlacklisted=await tokenBlacklistModel.findOne({token})
   if(isTokenBlacklisted){
    return res.status(400).json({
      message:"unauthorized access"
    })
   }
  try {
    const decoded= jwt.verify(token,process.env.JWT_SECRET_KEY)
   req.user=decoded
   next()
  } catch (err) {
     return res.status(400).json({
      message:"invalid token"
    })
  }
}
module.exports={authuser}