import React, { useState } from 'react'
import { apiFetch } from '../utils/api'

export default function Login({ onLogin }){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [display_name, setDisplayName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  async function submit(e){
    e.preventDefault();
    try{
      const path = isRegister ? '/register' : '/login';
      const body = isRegister ? { username, password, display_name } : { username, password };
      const res = await apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
      localStorage.setItem('arcadia_token', res.token);
      onLogin(res.token);
    }catch(err){
      setError(err.error || 'Erro');
    }
  }

  return (
    <div className="container">
      <h2>{isRegister ? 'Criar Conta' : 'Entrar'}</h2>
      <form onSubmit={submit}>
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        {isRegister && <input value={display_name} onChange={e=>setDisplayName(e.target.value)} placeholder="Nome a mostrar" />}
        <button type="submit">{isRegister ? 'Registar' : 'Entrar'}</button>
        <button type="button" onClick={()=>setIsRegister(!isRegister)} style={{background:'#aaa', marginTop:'10px'}}>
          {isRegister ? 'Já tenho conta' : 'Criar conta nova'}
        </button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  )
}
