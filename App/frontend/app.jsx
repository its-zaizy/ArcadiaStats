import React, { useEffect, useState } from 'react'
import Login from './pages/Login'
import Feed from './pages/Feed'
import { apiGet } from './utils/api'

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('arcadia_token'));
  const [profiles, setProfiles] = useState([]);

  useEffect(()=>{
    if(token){
      apiGet('/profiles', token)
        .then(r=>setProfiles(r.profiles))
        .catch(()=>{ setToken(null); localStorage.removeItem('arcadia_token'); });
    }
  },[token]);

  if(!token) return <Login onLogin={(t)=>setToken(t)} />

  return <Feed token={token} profiles={profiles} onLogout={()=>{
    setToken(null); localStorage.removeItem('arcadia_token');
  }} />
}
