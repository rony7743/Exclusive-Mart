import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import socket from '../../socket';
import { useNavigate, useParams } from 'react-router-dom';
import {  MessageCircle, User, Package, Eye } from 'lucide-react';

type Conversation = {
  chatId: string;
  product: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
    imgUrl: string;
    role: 'admin' | 'user';
  };
  createdAt: string;
  lastMessage?: {
    text: string;
    createdAt: string;
    role: 'admin' | 'user';
  };
};

const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  const queryClient = useQueryClient();
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Fetch conversations using React Query
  const fetchConversations = (): Promise<Conversation[]> => {
    return new Promise((resolve, reject) => {
      socket.emit('load_conversations');
      
      const handleLoaded = (convs: Conversation[]) => resolve(convs);
      const handleError = (err: any) => reject(new Error(`Socket error: ${err.message}`));

      socket.once('conversations_loaded', handleLoaded);
      socket.once('connect_error', handleError);
    });
  };

  const { 
    data: conversations = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery<Conversation[], Error>({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  // Listen for real-time updates
  useEffect(() => {
    const handleReload = () => {
      refetch();
    };

    const handleNewMessage = (message: any) => {
      // Update conversations with new message
      queryClient.setQueryData<Conversation[]>(['conversations'], (old = []) => {
        return old.map(conv => 
          conv.chatId === message.chatId 
            ? { ...conv, lastMessage: message }
            : conv
        );
      });
    };

    socket.on('reload_conversations', handleReload);
    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('reload_conversations', handleReload);
      socket.off('new_message', handleNewMessage);
    };
  }, [refetch, queryClient]);

  const truncate = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  // const handleBackClick = () => {
  //   navigate('/');
  // };

  const handleProductClick = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    navigate(`/details/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-4">
          <MessageCircle className="w-12 h-12 mx-auto mb-2" />
          <p>Failed to load conversations</p>
        </div>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {/* Header */}
      {/* <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {chatId && (
            <button
              onClick={handleBackClick}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
        </div>
      </div> */}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
            <p className="text-gray-400">Start selling to see your chats here</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.chatId}
                onClick={() => {
                  navigate(`/messages/${conv.chatId}`, {
                    state: {
                      user: conv.user,
                      name: conv.product.name,
                      userId: conv.user._id,
                      role: conv.user.role,
                    },
                  });
                }}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                  chatId === conv.chatId 
                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Product Image */}
                <div 
                  className="relative flex-shrink-0"
                  onMouseEnter={() => setHoveredProduct(conv.product._id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <img
                    src={conv.product.imageUrl}
                    alt="product"
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200 cursor-pointer"
                    onClick={(e) => handleProductClick(e, conv.product._id)}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png';
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-white flex items-center justify-center">
                    <Package className="w-3 h-3 text-gray-600" />
                  </div>

                  {/* Tooltip শুধু এইটুকু যোগ করেছি */}
                  {hoveredProduct === conv.product._id && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20">
                      <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          View Product
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  )}
                </div>

             
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 truncate text-sm">
                      {truncate(conv.product.name, 20)}
                    </h3>
                    {conv.lastMessage && (
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1">
                      <img
                        src={conv.user.imgUrl}
                        alt="user"
                        className="w-4 h-4 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <User className="w-4 h-4 text-gray-400" style={{display: conv.user.imgUrl ? 'none' : 'block'}} />
                      <span className="text-xs text-gray-600 truncate">
                        {conv.user.name}
                      </span>
                    </div>
                  </div>

                  {conv.lastMessage && (
                    <p className="text-xs text-gray-500 truncate">
                      {conv.lastMessage.role === 'admin' ? 'You: ' : ''}
                      {truncate(conv.lastMessage.text, 30)}
                    </p>
                  )}
                  
                  <div className="text-xs text-gray-400 mt-1">
                    ৳{conv.product.price.toLocaleString()}
                  </div>
                </div>

                {/* Active indicator */}
                {chatId === conv.chatId && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;