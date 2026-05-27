import axios from 'axios'
 const api=axios.create({
  baseURL:"http://localhost:3000",
  withCredentials:true
 })
export async function register({username,email,password}) {
  try {
     const response= await api.post('/api/auth/register',{
    username,email,password
  })// for coockies permission to server
  return (await response).data
  } catch (err) {
    console.log(err)
  }
}

export async function login({email,password}) {
  try {
     const response= await api.post('/api/auth/login',{
    email,password
  })// for coockies permission to server
  return (await response).data
  } catch (err) {
    console.log(err)
  }
}

export async function logout() {
  try {
     const response= await api.post('/api/auth/logout')// for coockies permission to server
  return (await response).data
  } catch (err) {
    console.log(err)
  }
}

export async function getMe() {
  try {
     const response= await api.get('/api/auth/get-me')// for coockies permission to server
  return (await response).data
  } catch (err) {
    console.log(err)
  }
}