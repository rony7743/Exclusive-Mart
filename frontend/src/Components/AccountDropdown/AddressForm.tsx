import { useState, type FormEvent } from 'react';
import { FaHeart, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotLogin from '../ui/NotLogin';

interface FormData {
  fullName: string ;
  street: string;
  city: string;
  district: string;
  thana: string;
  landmark: string;
  house: string;
  phone: string;
  country: string;
}

const AddressForm: React.FC = () => {
  const navigate = useNavigate();
  const { authData } = useAuth();
  const userId: string | null = authData?.userId || null;
  console.log("id", userId);
  const [formData, setFormData] = useState<FormData>({

    fullName: '',
    street: '',
    city: '',
    district: '',
    thana: '',
    landmark: '',
    house: '',
    phone: '',
    country: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const token = localStorage.getItem('token');

  if(!token) {
    return <NotLogin title='Please Login to Access Your Address' subject='Address' />
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/create`, formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setIsLoading(false);
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate(-1);
      }, 2000);
      setFormData({
        fullName: '',
        street: '',
        city: '',
        district: '',
        thana: '',
        landmark: '',
        house: '',
        phone: '',
        country: '',
      });
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to submit address. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleLikeToggle = () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg relative">
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center animate-fadeIn">
            <FaCheckCircle className="text-green-500 text-4xl mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Address Submitted Successfully!</h3>
            <p className="text-sm text-gray-600 mt-2">Redirecting...</p>
          </div>
        </div>
      )}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="mr-2">📍</span> Add Your Address
      </h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="street" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              Street
            </label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="city" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="district" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              District
            </label>
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="thana" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              Thana
            </label>
            <input
              type="text"
              id="thana"
              name="thana"
              value={formData.thana}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="landmark" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              Nearby Landmark (Optional)
            </label>
            <input
              type="text"
              id="landmark"
              name="landmark"
              value={formData.landmark}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label htmlFor="house" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              House Name/Number
            </label>
            <input
              type="text"
              id="house"
              name="house"
              value={formData.house}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              required
              pattern="[0-9]{10,11}"
              title="Please enter a 10 or 11 digit phone number"
              aria-required="true"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="country" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              required
              aria-required="true"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`flex items-center justify-center py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all w-full md:w-auto ${isLoading ? 'cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Address'
            )}
          </button>
          <button
            type="button"
            onClick={handleLikeToggle}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${isLiked ? 'text-red-500 border-red-500' : 'text-gray-500 border-gray-500'} border hover:bg-gray-100`}
            aria-label={isLiked ? 'Unlike this form' : 'Like this form'}
          >
            <FaHeart className={isLiked ? 'text-red-500' : 'text-gray-500'} />
            <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;