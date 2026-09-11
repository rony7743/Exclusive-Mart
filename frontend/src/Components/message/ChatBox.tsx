import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../../socket';
import {  Send, User,  CheckCheck } from 'lucide-react';

interface Props {
  conversation: {
    id: string;
    name: string;
    user: {
      name: string;
      imgUrl: string;
      email: string;
      role: 'admin' | 'user';
      userId: string;
    };
  };
}

interface MessageType {
  chatId: string;
  role: 'admin' | 'user';
  text: string;
  createdAt: string;
  _id?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

const ChatBox: React.FC<Props> = ({ conversation }) => {
  const { chatId } = useParams<{ chatId?: string }>();
  const [input, setInput] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [isTyping, setIsTyping] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAutoScroll = useRef(true);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isValidChatId = useMemo(
    () => !!chatId && chatId !== 'null' && chatId.trim() !== '' && chatId === conversation.id,
    [chatId, conversation.id]
  );

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.role === 'admin' || user?.role === 'user') {
        setRole(user.role);
      }
    }
  }, []);

  const fetchMessages = (): Promise<MessageType[]> => {
    return new Promise((resolve, reject) => {
      socket.emit('load_messages', conversation.id);

      const handleMessages = (loadedMessages: MessageType[]) => resolve(loadedMessages);
      const handleError = (err: any) => reject(new Error(`Socket error: ${err.message}`));

      socket.once('messages_loaded', handleMessages);
      socket.once('connect_error', handleError);
    });
  };

  const { data: messages = [], isLoading, error } = useQuery<MessageType[], Error>({
    queryKey: ['messages', conversation.id],
    queryFn: fetchMessages,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled: isValidChatId,
  });

  useEffect(() => {
    const onConnect = () => console.log('Socket connected:', socket.id);
    const onNewMessage = (message: MessageType) => {
      if (message.chatId === conversation.id && isValidChatId) {
        queryClient.setQueryData<MessageType[]>(['messages', conversation.id], (old = []) => {
          // Avoid duplicate messages
          const exists = old.some(msg => 
            msg.text === message.text && 
            Math.abs(new Date(msg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000
          );
          return exists ? old : [...old, message];
        });
      }
    };

    const onTyping = (data: { chatId: string; isTyping: boolean; role: string }) => {
      if (data.chatId === conversation.id && data.role !== role) {
        setIsTyping(data.isTyping);
      }
    };

    socket.on('connect', onConnect);
    socket.on('new_message', onNewMessage);
    socket.on('user_typing', onTyping);

    return () => {
      socket.off('connect', onConnect);
      socket.off('new_message', onNewMessage);
      socket.off('user_typing', onTyping);
    };
  }, [conversation.id, queryClient, isValidChatId, role]);

  const handleScroll = () => {
    if (!messageListRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
    isAutoScroll.current = scrollHeight - scrollTop - clientHeight < 50;
  };

  useEffect(() => {
    if (isAutoScroll.current && messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  // Typing indicator
  useEffect(() => {
    let typingTimer: NodeJS.Timeout;
    
    if (input.trim()) {
      socket.emit('typing', { chatId: conversation.id, isTyping: true, role });
      
      typingTimer = setTimeout(() => {
        socket.emit('typing', { chatId: conversation.id, isTyping: false, role });
      }, 1000);
    }

    return () => {
      if (typingTimer) clearTimeout(typingTimer);
    };
  }, [input, conversation.id, role]);

  const handleSend = () => {
    if (!isValidChatId || !input.trim()) return;

    const newMessage: MessageType = {
      chatId: conversation.id,
      role,
      text: input.trim(),
      createdAt: new Date().toISOString(),
      status: 'sending'
    };

    // Optimistic update
    queryClient.setQueryData<MessageType[]>(['messages', conversation.id], (old = []) => [...old, newMessage]);

    socket.emit('send_message', newMessage);
    setInput('');
    
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      isAutoScroll.current = true;
    }
  };

  const myUserId = useMemo(() => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr)._id;
  } catch {
    return null;
  }
}, []);

const isOwnChat = conversation.user.userId === myUserId;


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-white shadow-sm">
        <div className="flex items-center gap-4">
          {/* <button
            onClick={() => navigate('/messages')}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button> */}
          
<div
  className="flex items-center gap-3 flex-1 cursor-pointer"
  onClick={() => navigate(`/messages/viewprofile/${conversation.user.userId}`)}
>
  {!isOwnChat && (
    <>
      <div className="relative">
        <img
          src={conversation.user.imgUrl}
          alt="User"
          className="w-10 h-10 rounded-full object-cover border border-gray-200"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <User
          className="w-10 h-10 text-gray-400 border border-gray-200 rounded-full p-2"
          style={{ display: conversation.user.imgUrl ? 'none' : 'block' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{conversation.user.name}</h3>
        <p className="text-sm text-gray-500 truncate">{conversation.user.email}</p>
      </div>
    </>
  )}
  {isOwnChat && (
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-gray-900 truncate">You</h3>
      <p className="text-sm text-gray-500 truncate">This is your own chat</p>
    </div>
  )}
</div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messageListRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {!isValidChatId ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <p>No chat selected</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            <div className="text-center">
              <p className="mb-4">Failed to load messages</p>
              <button 
                onClick={() => queryClient.refetchQueries({ queryKey: ['messages', conversation.id] })}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">👋</div>
              <h3 className="font-medium mb-2">Start the conversation!</h3>
              <p className="text-sm text-gray-400">Send a message to begin chatting</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isOwn = msg.role === role;
              const showAvatar = i === 0 || messages[i-1]?.role !== msg.role;
              
              return (
                <div key={i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isOwn && showAvatar && (
                      <img
                        src={conversation.user.imgUrl}
                        alt="User"
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    {!isOwn && !showAvatar && <div className="w-6"></div>}
                    
                    <div
                      className={`px-4 py-2 rounded-2xl break-words shadow-sm ${
                        isOwn 
                          ? 'bg-blue-600 text-white rounded-br-md' 
                          : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                          {formatMessageTime(msg.createdAt)}
                        </span>
                        {isOwn && (
                          <CheckCheck className={`w-3 h-3 ${msg.status === 'read' ? 'text-blue-200' : 'text-blue-300'}`} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <img
                    src={conversation.user.imgUrl}
                    alt="User"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="bg-gray-200 px-4 py-2 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full border border-gray-300 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Type your message..."
              disabled={!isValidChatId}
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-3 rounded-2xl transition-colors duration-200"
            disabled={!isValidChatId || !input.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;