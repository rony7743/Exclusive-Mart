import axios from 'axios';
import { useState, useEffect, type FormEvent } from 'react';
import { FaCreditCard, FaLock, FaUser, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { SiVisa, SiMastercard, SiAmericanexpress } from 'react-icons/si';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import AlertDialog from '../ui/ConfirmOrderDilog';
import SimpleAlert from '../ui/SuccessAlert';


interface Address {
  _id: string;
  fullName: string;
  district: string;
  thana: string;
  phone: string;
  street: string;
  city: string;
  landmark: string;
  house: string;
  country: string;
}

const CardPayment = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const price = Number(searchParams.get('price')) || 0;
  const quantity = Number(searchParams.get('quantity')) || 1;
  const { authData } = useAuth();
  const userId = authData?.userId || null;

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'amex' | null>(null);
  
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
 // console.log(addresses);
  const [error, setError] = useState<string | null>(null);
  const [showNoAddressPopup, setShowNoAddressPopup] = useState(false);
  const [showCODConfirmationPopup, setShowCODConfirmationPopup] = useState(false);
  const [showCardPaymentErrorPopup, setShowCardPaymentErrorPopup] = useState(false);

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

// confirmCashOnDelivery ফাংশন সংশোধন
const confirmCashOnDelivery = async () => {
  setIsProcessing(true);
  try {
    await axios.post(
      `${import.meta.env.VITE_APP_API_URL}/api/cash-on-delivery`,
      {
      id,
      quantity,
      addressId: addresses[0]?._id, // Sending the address ID
      },
      {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
      }
    );
    setIsProcessing(false);
    setShowCODConfirmationPopup(false);
    setShowSuccessAlert(true); // SimpleAlert দেখানোর জন্য
    setTimeout(() => {
      setShowSuccessAlert(false);
      navigate('/orders');
    }, 2000); // ২ সেকেন্ড পর অ্যালার্ট বন্ধ করে নেভিগেট
  } catch (error) {
    setIsProcessing(false);
    setShowCODConfirmationPopup(false);
    setError('Failed to place order. Please try again.');
  }
};

  useEffect(() => {
    if (/^4/.test(cardNumber.replace(/\s/g, ''))) {
      setCardType('visa');
    } else if (/^5[1-5]/.test(cardNumber.replace(/\s/g, ''))) {
      setCardType('mastercard');
    } else if (/^3[47]/.test(cardNumber.replace(/\s/g, ''))) {
      setCardType('amex');
    } else {
      setCardType(null);
    }
  }, [cardNumber]);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/api/getaddress`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            },
          }
        );
        setAddresses(response.data);
      } catch (error) {
        console.error('Error fetching address:', error);
        setError('Failed to fetch address. Please try again.');
      }
    };

    fetchData();
  }, [userId]);

  const handleDeleteAddress = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_APP_API_URL}/api/delete/${addresses[0]?._id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      setAddresses([]);
      setError(null);
    } catch (error) {
      console.error('Error deleting address:', error);
      setError('Failed to delete address. Please try again.');
    }
  };

  const cashOnDelivery = () => {
    // if (!userId) {
    //   setError('User not authenticated. Please log in.');
    //   return;
    // }
    if (isNaN(price) || price <= 0) {
      setError('Invalid price value.');
      return;
    }
    if (addresses.length === 0) {
      setShowNoAddressPopup(true);
      return;
    }
    setShowCODConfirmationPopup(true); // Show COD confirmation popup
  };

  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // if (!userId) {
    //   setError('User not authenticated. Please log in.');
    //   return;
    // }
    if (isNaN(price) || price <= 0) {
      setError('Invalid price value.');
      return;
    }
    if (addresses.length === 0) {
      setShowNoAddressPopup(true);
      return;
    }
    setShowCardPaymentErrorPopup(true); // Show card payment error popup
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts: string[] = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : value;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setExpiryDate(value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* No Address Popup */}
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


      {showCODConfirmationPopup && addresses.length > 0 && (
        <AlertDialog
          open={showCODConfirmationPopup}
          address ={addresses[0]}
          onClose={() => setShowCODConfirmationPopup(false)}
          onConfirm={confirmCashOnDelivery}
        />
      )}


      {showSuccessAlert && (
      <SimpleAlert
        open={showSuccessAlert}
        message="Order placed successfully!"
        onClose={() => setShowSuccessAlert(false)}
      />
    )}

      {/* Card Payment Error Popup */}
      {showCardPaymentErrorPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center animate-fadeIn max-w-sm">
            <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Card Payment Unavailable</h3>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Sorry, card payment is currently unavailable. Please use Cash on Delivery.
            </p>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowCardPaymentErrorPopup(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCardPaymentErrorPopup(false);
                  cashOnDelivery();
                }}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
              >
                Proceed with COD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Preview */}
      <div
        className={`relative h-48 mb-8 rounded-xl shadow-lg transition-all duration-500 transform ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          perspective: '1000px',
        }}
      >
        <div className={`absolute inset-0 p-6 flex flex-col justify-between ${isFlipped ? 'hidden' : 'block'}`}>
          <div className="flex justify-between items-center">
            <FaCreditCard className="text-white text-2xl" />
            {cardType === 'visa' && <SiVisa className="text-white text-3xl" />}
            {cardType === 'mastercard' && <SiMastercard className="text-white text-3xl" />}
            {cardType === 'amex' && <SiAmericanexpress className="text-white text-3xl" />}
          </div>
          <div className="mt-4">
            <div className="text-white font-mono text-xl tracking-wider">
              {cardNumber || '•••• •••• •••• ••••'}
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs text-white opacity-70">Card Holder</div>
              <div className="text-white font-medium">{cardName || 'YOUR NAME'}</div>
            </div>
            <div>
              <div className="text-xs text-white opacity-70">Expires</div>
              <div className="text-white font-medium">{expiryDate || '••/••'}</div>
            </div>
          </div>
        </div>
        <div className={`absolute inset-0 p-6 ${isFlipped ? 'block' : 'hidden'}`}>
          <div className="h-8 bg-black mt-4"></div>
          <div className="mt-4 flex items-center">
            <div className="bg-white rounded-sm p-1 text-xs text-right pr-2 w-full">{cvv || '•••'}</div>
          </div>
          <div className="flex justify-end mt-8">
            {cardType === 'visa' && <SiVisa className="text-white text-3xl" />}
            {cardType === 'mastercard' && <SiMastercard className="text-white text-3xl" />}
            {cardType === 'amex' && <SiAmericanexpress className="text-white text-3xl" />}
          </div>
        </div>
      </div>

      {/* Address Section */}
      {addresses.length === 0 ? (
        <div
          onClick={() => navigate('/details/payment/address')}
          className="cursor-pointer flex items-center justify-between p-6 border border-gray-300 hover:bg-gray-50 rounded-lg mb-6 bg-white shadow-sm"
        >
          <div className="text-lg font-medium text-gray-800">Add New Address</div>
          <div className="text-3xl font-bold text-green-600">+</div>
        </div>
      ) : (
        <div className="p-6 border border-gray-300 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-all mb-6">
          <div className="flex justify-between items-start">
            <div className="text-gray-800">
              <p className="font-semibold">{addresses[0].fullName}</p>
              <p>{addresses[0].house}, {addresses[0].street}</p>
              <p>{addresses[0].thana}, {addresses[0].district}, {addresses[0].city}</p>
              <p>{addresses[0].country}</p>
              <p className="mt-2">Phone: {addresses[0].phone}</p>
              {addresses[0].landmark && <p>Nearby Landmark: {addresses[0].landmark}</p>}
            </div>
            <div className="">
              <button
                onClick={() => handleDeleteAddress()}
                className="flex items-center px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                aria-label={`Delete address for ${addresses[0].fullName}`}
              >
                <FaTrash className="mr-1" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Payment Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FaLock className="mr-2 text-blue-500" /> Payment Information
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="cardNumber" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FaCreditCard className="mr-2 text-gray-500" /> Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              aria-required="true"
            />
          </div>
          <div className="mb-5">
            <label htmlFor="cardName" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FaUser className="mr-2 text-gray-500" /> Cardholder Name
            </label>
            <input
              type="text"
              id="cardName"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              aria-required="true"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                id="expiryDate"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="cvv"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  onFocus={() => setIsFlipped(true)}
                  onBlur={() => setIsFlipped(false)}
                  placeholder="•••"
                  maxLength={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  aria-required="true"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isProcessing}
            aria-busy={isProcessing}
            className={`w-full py-4 px-6 rounded-lg text-white font-bold ${
              isProcessing ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } transition-all flex items-center justify-center shadow-md hover:shadow-lg`}
          >
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing Payment...
              </>
            ) : (
              <>Order Now ${price.toFixed(2)}</>
            )}
          </button>
        </form>
        <div className="mt-6 flex items-center justify-center">
          <div className="flex space-x-4">
            <SiVisa className="text-gray-400 text-2xl" />
            <SiMastercard className="text-gray-400 text-2xl" />
            <SiAmericanexpress className="text-gray-400 text-2xl" />
          </div>
        </div>
        <p className="text-xs text-center text-gray-500 mt-3 flex items-center justify-center">
          <FaLock className="mr-1" /> Secure SSL encrypted payment
        </p>
      </div>

      <div>
        <div className="text-3xl font-semibold mt-20 px-10 py-4 flex text-black/90 justify-center">
          Or Cash On Delivery
        </div>
        <button
          onClick={cashOnDelivery}
          disabled={isProcessing}
          aria-busy={isProcessing}
          className={`w-full py-4 px-6 rounded-lg text-white font-bold ${
            isProcessing ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          } transition-all flex items-center justify-center shadow-md hover:shadow-lg`}
        >
          {isProcessing ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing Payment...
            </>
          ) : (
            <>Order Now ${price.toFixed(2)}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default CardPayment;