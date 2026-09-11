import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaTrash, FaEdit, FaPlus, FaSpinner, FaExclamationTriangle, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showNoAddressPopup, setShowNoAddressPopup] = useState<boolean>(false); // Assuming this state is managed elsewhere or needed
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    const fetchAddresses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/getaddress`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        setAddresses(response.data);
      } catch (err) {
        console.error('Error fetching addresses:', err);
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setAddresses([]); // No addresses found
        } else {
          setError('Failed to fetch addresses. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchAddresses();
    } else {
      setError("Authentication token not found. Please log in.");
      setIsLoading(false);
    }
  }, [token]);

  const handleDeleteAddress = async (addressId: string) => {
    // Note: Your current backend seems to delete the first address or a specific one.
    // This frontend logic assumes you want to delete a specific address by ID.
    // If your backend deletes the *first* address always, this needs adjustment or backend change.
    const addressToDelete = addresses.find(addr => addr._id === addressId);
    if (!addressToDelete) return;

    if (window.confirm(`Are you sure you want to delete the address for ${addressToDelete.fullName}?`)) {
      try {
        await axios.delete(`${import.meta.env.VITE_APP_API_URL}/api/delete/${addressId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        setAddresses((prevAddresses) => prevAddresses.filter((addr) => addr._id !== addressId));
        setError(null);
      } catch (err) {
        console.error('Error deleting address:', err);
        setError('Failed to delete address. Please try again.');
      }
    }
  };
  
  // Placeholder for edit functionality
  const handleEditAddress = (addressId: string) => {
    // Navigate to an edit address form, passing the addressId
    navigate(`/details/payment/address/${addressId}`); // Example route
    console.log("Edit address:", addressId)
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <FaSpinner className="animate-spin text-blue-500 text-3xl" />
        <p className="ml-2 text-gray-600">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">My Addresses</h2>
        <button
          onClick={() => navigate('/details/payment/address')} // Navigate to Add Address Form
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors"
        >
          <FaPlus className="mr-2" /> Add New Address
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {showNoAddressPopup && ( // This popup logic might be part of a parent component or a specific flow
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center animate-fadeIn max-w-sm">
            <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Address Required</h3>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Please add an address to proceed.
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

      {addresses.length === 0 && !isLoading && !error && (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <FaMapMarkerAlt className="text-gray-400 text-5xl mx-auto mb-4" />
          <p className="text-gray-600 text-lg">You haven't added any addresses yet.</p>
          <p className="text-sm text-gray-500 mt-1">Click "Add New Address" to get started.</p>
        </div>
      )}

      {addresses.length > 0 && (
        <div className="space-y-6">
          {addresses.map((address) => (
            <div key={address._id} className="p-6 border border-gray-200 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start">
                <div className="text-gray-800 mb-4 sm:mb-0">
                  <p className="font-bold text-lg">{address.fullName}</p>
                  <p className="text-sm text-gray-600">
                    {address.house ? `${address.house}, ` : ''}
                    {address.street ? `${address.street}, ` : ''}
                    {address.thana ? `${address.thana}, ` : ''}
                    {address.district ? `${address.district}` : ''}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.city ? `${address.city}, ` : ''}
                    {address.country || ''}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
                  {address.landmark && <p className="text-sm text-gray-500 mt-1">Nearby: {address.landmark}</p>}
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleEditAddress(address._id)}
                    className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label={`Edit address for ${address.fullName}`}
                  >
                    <FaEdit className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address._id)}
                    className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label={`Delete address for ${address.fullName}`}
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewAddress;