const express=require('express')
const authRouter=express.Router()
const authController=require('../controllers/auth.controller')
const authMiddleware=require('../middleware/auth.middleware')
authRouter.post('/register',authController.registerController)
authRouter.post('/login',authController.userLogin)
authRouter.post('/logout',authController.userLogOut)
authRouter.get('/get-me',authMiddleware.authuser,authController.getMe)
module.exports=authRouter