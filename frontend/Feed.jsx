import React, { useEffect, useState } from 'react'
import { apiFetch, apiGet } from '../utils/api'

export default function Feed({ token, profiles, onLogout }){
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [profile_id, setProfileId] = useState(profiles[0]?.id || '');

  async function load(){
    const data = await apiGet('/posts');
    setPosts(data.posts);
  }

  async function createPost(e){
    e.preventDefault();
    if(!content) return;
    await apiFetch('/posts', {
      method: 'POST',
      body: JSON.stringify({ content, profile_id })
    }, token);
    setContent('');
    load();
  }

  useEffect(()=>{ load(); }, []);

  return (
    <>
      <header>
        <h1>🏰 Arcadia</h1>
        <button onClick={onLogout}>Sair</button>
      </header>

      <div className="container">
        <div className="card">
          <h3>Novo Post</h3>
          <form onSubmit={createPost}>
            <select value={profile_id} onChange={e=>setProfileId(e.target.value)}>
              {profiles.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="O que está a acontecer?" />
            <button type="submit">Publicar</button>
          </form>
        </div>

        {posts.map(p=>(
          <div className="card post" key={p.id}>
            <div className="author">{p.profile_name}</div>
            <div>{p.content}</div>
          </div>
        ))}
      </div>
    </>
  )
}
