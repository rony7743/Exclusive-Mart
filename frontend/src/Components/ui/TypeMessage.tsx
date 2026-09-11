import React, { useState, useEffect } from 'react';
import { Button } from './Button'; // আপনার কাস্টম বাটন কম্পোনেন্ট
import { X } from 'lucide-react'; // একটি আইকন, না থাকলে react-icons/fa থেকে FaTimes ব্যবহার করতে পারেন

interface TypeMessageProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string, productInfo?: { productId: string; productName: string }) => void;
  productName?: string;
  productImage?: string; 
  price?: number;
  productId?: string;
  defaultMessageOptions?: string[];
}

const TypeMessage: React.FC<TypeMessageProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  productName,
  productId,
  productImage,
  price,
  defaultMessageOptions = [ // ডিফল্ট কিছু অপশন
    "Is this item still available?",
    "What are the shipping options?",
    "Can I get more details about this product?"
  ]
}) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // পপআপ খোলা বা বন্ধ হলে মেসেজ ইনপুট রিসেট করুন
    if (!isOpen) {
      setMessage('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleOptionClick = (option: string) => {
    // অপশনে ক্লিক করলে মেসেজ ইনপুটে সেট করুন অথবা আগের মেসেজের সাথে যোগ করুন
    setMessage(prevMessage => prevMessage ? `${prevMessage} ${option}` : option);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const productInfo = productId && productName && productImage && price
       ? { productId, productName, productImage, price } : undefined;
      onSendMessage(message, productInfo);
      setMessage(''); // মেসেজ পাঠানোর পর ইনপুট ক্লিয়ার করুন
      // onClose(); // মেসেজ পাঠানোর পর পপআপ বন্ধ করতে চাইলে এটি আনকমেন্ট করুন
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close message popup"
        >
          <X size={24} /> {/* অথবা <FaTimes /> */}
        </button>

        <h2 className="text-xl font-semibold mb-4">
          Message about {productName || 'this product'}
        </h2>

        {defaultMessageOptions && defaultMessageOptions.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Or click a quick message:</p>
            <div className="flex flex-wrap gap-2">
              {defaultMessageOptions.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleOptionClick(option)}
                  className="text-xs" // ছোট টেক্সটের জন্য
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="messageText" className="block text-sm font-medium text-gray-700 mb-1">
              Your Message
            </label>
            <textarea
              id="messageText"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your message here..."
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">
              Send Message
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TypeMessage;