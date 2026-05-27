const userModel=require('../model/user.model')
const tokenBlacklistModel=require('../model/blacklist.model')
const bcrypt= require('bcryptjs')
const jwt=require('jsonwebtoken')
async function registerController(req,res) {
  try {
    const {username,email,password}=req.body
    if(!username|| !email  || !password){
      return res.status(400).json({
        message:"Please Provide username ,email and password"
      })
    }
     
    const isUserExist=await userModel.findOne({
      $or:[{username},{email}]
    })
   if(isUserExist){
    return res.status(400).json({
      message:"user already exist"
    })
   }
   
   const hash= await bcrypt.hash(password,10)
   
   const user= await userModel.create({
    username,
    email,
    password:hash
   })
   const token=jwt.sign({
    id:user._id,username:user.username
   },process.env.JWT_SECRET_KEY,{expiresIn:"1d"})

   res.cookie("token",token)
    return res.status(201).json({
      message:"user registerd successfully"
})
   res.status(200).json({

    message:"user register successfully",
    user:{id:user._id,
    username:user.username,
    email:user.email}
   })
  } catch (error) {
    console.log(error)
  }
}

async function userLogin(req,res) {
  const {email,password}=req.body
  if(!email || !password){
    return res.status(400).json({
      message:"email and password required"
    })
  }
  const user=await userModel.findOne({email})

  if(!user){
    return res.status(400).json({
      message:"Invalid email or password"
    })
  }
  const isPasswordValid=await bcrypt.compare(password,user.password)

  if(!isPasswordValid){
    return res.status(400).json({
      message:"Invalid email or password"
    })
  }
  const token= jwt.sign({
    id:user._id,username:user.username
  },process.env.JWT_SECRET_KEY,{expiresIn:"1d"})

  res.cookie("token",token)

   res.status(200).json({

    message:"user loggedIn successfully",
    user:{id:user._id,
    username:user.username,
    email:user.email}
   }) 
}

async function userLogOut(req,res) {
  const token=req.cookies.token
  if(token){
    await tokenBlacklistModel.create({token})
  }
  res.clearCookie("token")

  res.status(200).json({
    message:"user logged out successfully"
  })
}

async function getMe(req,res) {
  const user =await userModel.findById(req.user.id)

  res.status(200).json({
    message:"user details fetched successfully",
    user:{
      id:user._id,
      username:user.username,
      email:user.email
    }
  })
}
module.exports={registerController,userLogin,userLogOut,getMe}