import { Children, useState } from "react";
import { createContext } from "react";
import { getMe } from "./services/auth.api";
export const AuthContex= createContext()

 export const AuthProvider=({children})=>{
  const [user ,setUser]=useState(null);
  const [loading,setLoading]=useState(true)

  


  return <AuthContex.Provider value={{user ,setUser,loading,setLoading}}>
    {children}
  </AuthContex.Provider>
 }