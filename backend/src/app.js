const express =require('express')
const cookieParser=require('cookie-parser')
const cors =require('cors')
const path=require('path')
const app= express()
const _dirname=path.resolve();
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin:"http://localhost:5173"||"https://interviewai-svlt.onrender.com",
  credentials:true
}))
const authRouter=require('./routes/auth.routes')
const interviewRouter = require('./routes/interview.routes')

app.use('/api/auth',authRouter)
app.use('/api/interview',interviewRouter)
app.use(express.static(path.join(__dirname, "..", "..", "frontend", "dist")));

app.use((req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "..", "frontend", "dist", "index.html"));
});

module.exports=app