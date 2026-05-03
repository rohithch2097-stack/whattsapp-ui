import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import './App.css'
import Login from './Login';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

function MainLayout({ user, setUser }) {
  return (
    <div className="app-main-layout">
      <ChatList user={user} setUser={setUser} />
      <div className="chat-window-main">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/chats" element={user ? <MainLayout user={user} setUser={setUser} /> : <Navigate to="/login" />}>
          <Route path="chat/:conversationId" element={<ChatWindow user={user} />} />
          <Route index element={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'#888',fontSize:'1.3em'}}>Select a chat to start messaging</div>} />
        </Route>
        <Route path="*" element={<Navigate to={user ? "/chats" : "/login"} />} />
      </Routes>
    </Router>
  )
}

export default App
