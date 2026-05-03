// ChatWindow.jsx

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_URL = import.meta.env.VITE_API_URL;

const ChatWindow = ({ user }) => {

  const { conversationId } = useParams();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {

    axios.get(
      `${API_URL}/api/messages/conversation/${conversationId}`
    )
      .then(res => {
        setMessages(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

  }, [conversationId]);

  useEffect(() => {

    const socket = new SockJS(`${API_URL}/ws`);

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

    return () => {
      stompClient.current.deactivate();
    };

  }, [conversationId]);

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });

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
            className={`message-bubble ${m.senderId === user.id ? 'me' : ''}`}
          >
            {m.content}
          </div>
        ))}

        <div ref={messagesEndRef} />

      </div>

      <form
        className="ChatWindow-input"
        onSubmit={sendMessage}
      >

        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />

        <button type="submit">
          Send
        </button>

      </form>

    </div>
  );
};

export default ChatWindow;