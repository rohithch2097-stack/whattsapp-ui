import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const ChatWindow = ({ user }) => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch messages for this conversation
    axios.get(`/api/messages/conversation/${conversationId}`)
      .then(res => {
        setMessages(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const socket = new SockJS('http://localhost:8089/ws'); // Connect directly to backend
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        stompClient.current.subscribe(
          `/topic/conversation/${conversationId}`,
          (msg) => {
            const message = JSON.parse(msg.body);
            setMessages(prev => [...prev, message]);
          }
        );
      },
    });
    stompClient.current.activate();
    return () => stompClient.current.deactivate();
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = {
      conversationId: Number(conversationId),
      senderId: user.id,
      content: input,
      timestamp: new Date().toISOString(),
    };
    stompClient.current.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(msg),
    });
    setInput('');
  };

  if (loading) return <div>Loading messages...</div>;

  return (
    <div className="ChatWindow">
      <div className="ChatWindow-messages">
        {messages.map(m => (
          <div
            key={m.id}
            className={`message-bubble${m.senderId === user.id ? ' me' : ''}`}
          >
            {m.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="ChatWindow-input" onSubmit={sendMessage}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatWindow;
