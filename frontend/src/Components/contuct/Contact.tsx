import React, { useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields (Name, Email, Message).');
      return;
    }

    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${apiUrl}/api/contact`, formData);

      if (response.data.success) {
        toast.success(response.data.message || 'Message sent successfully!');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        toast.error(response.data.error || 'Failed to send message.');
      }
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      toast.error(error.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center  px-4">
      <div className="w-full  mx-auto bg-white shadow-lg rounded-lg flex flex-col lg:flex-row">
        {/* Left Side - Contact Info */}
        <div className="w-full lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Contact Us</h2>

          <div className="mb-6">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white">📞</span>
              </div>
              <h3 className="text-lg font-medium">Call Us</h3>
            </div>
            <p className="text-gray-600">Available 24/7, 7 days a week</p>
            <p className="text-gray-800 font-medium">Phone: +88018112222</p>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white">✉️</span>
              </div>
              <h3 className="text-lg font-medium">Write to Us</h3>
            </div>
            <p className="text-gray-600">Fill out the form and we'll contact you within 24 hours</p>
            <p className="text-gray-800 font-medium">Email: customer@exclusive.com</p>
            <p className="text-gray-800 font-medium">Support: support@exclusive.com</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-2/3 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-gray-700 font-medium mb-1" htmlFor="name">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-gray-700 font-medium mb-1" htmlFor="email">
                  Your Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-gray-700 font-medium mb-1" htmlFor="phone">
                  Your Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="message">
                Your Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={5}
                required
              ></textarea>
            </div>

            <div className="text-right">
              <button
                type="submit"
                disabled={loading}
                className={`bg-red-500 text-white px-6 py-2 rounded font-medium transition-colors ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-600'
                }`}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;