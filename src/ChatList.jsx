// ChatList.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const ChatList = ({ user }) => {
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [participantsMap, setParticipantsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Fetch conversations for the user
    axios.get(`${API_URL}/api/participants/user/${user.id}`)
      .then(async res => {
        const convs = res.data.map(p => p.conversation);

        setConversations(convs);

        // Fetch participants for direct chats
        const map = {};

        await Promise.all(
          convs
            .filter(c => !c.isGroup)
            .map(async c => {
              const resp = await axios.get(
                `${API_URL}/api/participants/conversation/${c.id}`
              );

              map[c.id] = resp.data;
            })
        );

        setParticipantsMap(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch all users
    axios.get(`${API_URL}/api/users`)
      .then(res => {
        setAllUsers(res.data.filter(u => u.id !== user.id));
      });

  }, [user]);

  const startChat = (otherUserId) => {

    axios.get(
      `${API_URL}/api/conversations/direct?user1=${user.id}&user2=${otherUserId}`
    )
      .then(async res => {

        setConversations(prev => {
          if (prev.find(c => c.id === res.data.id)) return prev;

          return [res.data, ...prev];
        });

        const resp = await axios.get(
          `${API_URL}/api/participants/conversation/${res.data.id}`
        );

        setParticipantsMap(prev => ({
          ...prev,
          [res.data.id]: resp.data
        }));

        navigate(`/chats/chat/${res.data.id}`);
      });
  };

  if (loading) return <div>Loading chats...</div>;

  return (
    <div className="ChatList">

      <div className="wa-sidebar-header">
        Recent Chats
      </div>

      <ul className="wa-chat-list">

        {conversations.map(conv => {

          let displayName = conv.name;

          if (!conv.isGroup && participantsMap[conv.id]) {

            const others = participantsMap[conv.id]
              .filter(p => p.user.id !== user.id);

            if (others.length > 0) {
              displayName = others[0].user.username;
            }
          }

          const avatar = displayName
            ? displayName[0].toUpperCase()
            : '?';

          return (
            <li
              key={conv.id}
              className="wa-chat-list-item"
              onClick={() => navigate(`/chats/chat/${conv.id}`)}
            >
              <div className="wa-avatar">
                {avatar}
              </div>

              <div className="wa-chat-info">
                <div className="wa-chat-title">
                  {displayName} {conv.isGroup ? '(Group)' : ''}
                </div>
              </div>
            </li>
          );
        })}

      </ul>

      <div
        className="wa-sidebar-header"
        style={{ fontSize: '1em', marginTop: 16 }}
      >
        Start New Chat
      </div>

      <ul className="wa-chat-list">

        {allUsers.map(u => (

          <li
            key={u.id}
            className="wa-chat-list-item"
            onClick={() => startChat(u.id)}
          >

            <div className="wa-avatar">
              {u.username[0].toUpperCase()}
            </div>

            <div className="wa-chat-info">
              <div className="wa-chat-title">
                {u.username}
              </div>
            </div>

          </li>
        ))}

      </ul>

    </div>
  );
};

export default ChatList;