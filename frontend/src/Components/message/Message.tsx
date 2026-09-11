import React, { useState, useEffect, useMemo } from 'react';
import ChatList from './ChatList';
import ChatBox from './ChatBox';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, LogIn, UserPlus, Lock } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface ConversationType {
  id: string;
  name: string;
  user: {
    name: string;
    email: string;
    imgUrl: string;
    role: 'admin' | 'user';
    userId: string;
  };
}

const Message: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<ConversationType | null>(null);
  const { chatId } = useParams<{ chatId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { authData } = useAuth();
  const token = authData.token || localStorage.getItem('token');

  useEffect(() => {
    if (chatId && location.state?.user) {
      const user = location.state.user;
      const name = location.state.name || '';
      setSelectedConversation({ id: chatId, name, user });
    } else {
      setSelectedConversation(null);
    }
  }, [chatId, location.state]);

  const stableConversation = useMemo(() => {
    return selectedConversation ? { ...selectedConversation } : null;
  }, [selectedConversation?.id, selectedConversation?.name, selectedConversation?.user]);

  // Login Required UI
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
              <Lock className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Access Your Messages
            </h2>
            
            {/* Description */}
            <p className="text-gray-600 mb-8 leading-relaxed">
              Please log in to view and manage your conversations. Connect with sellers and buyers securely.
            </p>

            {/* Message Icon Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <MessageCircle className="w-16 h-16 text-blue-200 animate-pulse" />
                <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full animate-bounce"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Sign In to Messages
              </button>
              
              <button
                onClick={() => navigate('/signup')}
                className="w-full bg-white border-2 border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Create New Account
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Secure & Private</span>
                </div>
                <div className="mx-4 w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Real-time Chat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Chat Interface (when logged in)
  return (
    <div className="flex flex-col md:flex-row h-[80vh] bg-gray-50">
      {/* Desktop Chat List - Fixed width */}
      <div className="hidden md:flex md:w-[350px] border-r border-gray-200 bg-white overflow-y-auto">
        <ChatList />
      </div>
      
      {/* Mobile View */}
      <div className="md:hidden w-full h-full">
        {!stableConversation ? (
          <ChatList />
        ) : (
          <div className="h-full flex flex-col">
            <button 
              onClick={() => setSelectedConversation(null)}
              className="p-2 bg-gray-100 flex items-center gap-2 border-b hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to chats</span>
            </button>
            <div className="flex-1 overflow-auto">
              <ChatBox conversation={stableConversation} />
            </div>
          </div>
        )}
      </div>
      
      {/* Desktop Chat Box - Flexible space */}
      <div className="hidden md:flex flex-1 min-w-0">
        {stableConversation ? (
          <div className="w-full h-full">
            <ChatBox conversation={stableConversation} />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-500 bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
              <p className="text-gray-400">Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
