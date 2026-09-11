import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Address {
  _id: string;
  fullName: string;
  district: string;
  thana: string;
  phone: string;
  street?: string;
  city?: string;
  landmark?: string;
  house?: string;
  country?: string;
}

const ViewAddress: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showNoAddressPopup, setShowNoAddressPopup] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); // লোডিং স্টেট যুক্ত
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // লোডিং শুরু
      setError(null); // পূর্বের এরর ক্লিয়ার
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/getaddress`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        setAddresses(response.data);
      } catch (error) {
        console.error('Error fetching address:', error);
        setError('Faild To Fetch Address');
      } finally {
        setIsLoading(false); // লোডিং শেষ
      }
    };

    fetchData();
  }, [token]);

  const handleDeleteAddress = async () => {
    if (!addresses[0]?._id) return; // _id না থাকলে ফাংশন থেকে বেরিয়ে যান
    setIsLoading(true); // লোডিং শুরু
    setError(null); // পূর্বের এরর ক্লিয়ার
    try {
      await axios.delete(`${import.meta.env.VITE_APP_API_URL}/api/delete/${addresses[0]._id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setAddresses([]);
    } catch (error) {
      console.error('Error deleting address:', error);
      setError('Failed to delete address. Please try again.');
    } finally {
      setIsLoading(false); // লোডিং শেষ
    }
  };

  return (
    <div className="max-w-4xl h-screen mx-auto p-6">
     
      {isLoading && <LoadingSpinner message="Loading..." />}

     
      {showNoAddressPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center animate-fadeIn max-w-sm">
            <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Address Required</h3>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Please add an address to proceed with payment.
            </p>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowNoAddressPopup(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate('/details/payment/address')}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
              >
                Add Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* এরর মেসেজ */}
      {error && !isLoading && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* অ্যাড্রেস প্রদর্শন বা নতুন অ্যাড্রেস যুক্ত করার UI */}
      {!isLoading && addresses.length === 0 ? (
        <div
          onClick={() => navigate('/details/payment/address')}
          className="cursor-pointer flex items-center justify-between p-6 border border-gray-300 hover:bg-gray-50 rounded-lg mb-6 bg-white shadow-sm"
        >
          <div className="text-lg font-medium text-gray-800">Add New Address</div>
          <div className="text-3xl font-bold text-green-600">+</div>
        </div>
      ) : (
        !isLoading && (
          <div className="p-6 border border-gray-300 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-all mb-6">
            <div className="flex justify-between items-start">
              <div className="text-gray-800">
                <p className="font-semibold">{addresses[0]?.fullName}</p>
                <p>{addresses[0]?.house}, {addresses[0]?.street}</p>
                <p>{addresses[0]?.thana}, {addresses[0]?.district}, {addresses[0]?.city}</p>
                <p>{addresses[0]?.country}</p>
                <p className="mt-2">Phone: {addresses[0]?.phone}</p>
                {addresses[0]?.landmark && <p>Nearby Landmark: {addresses[0]?.landmark}</p>}
              </div>
              <div>
                <button
                  onClick={handleDeleteAddress}
                  className="flex items-center px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                  aria-label={`Delete address for ${addresses[0]?.fullName}`}
                >
                  <FaTrash className="mr-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default ViewAddress;