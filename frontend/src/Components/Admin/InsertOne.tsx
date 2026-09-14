import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { optimizeImages } from '../../utils/imageOptimizer';
import '../ui/InsertFormCss.css'; // We'll create a separate CSS file

// Define form data interface
interface FormData {
  name: string;
  price: number;
  oldPrice: number;
  description: string;
  size: string;
  images: File[];
  category: string;
  inStock: boolean;
  brand?: string;
  weight?: number;
  tags: string[];
}

// Success Popup Component with Animation
const SuccessPopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}> = ({ isOpen, onClose, productName }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-500 scale-100 animate-slideUp">
        <div className="p-8 text-center">
          {/* Animated Success Icon */}
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-green-400 to-green-600 mb-6 animate-bounce">
            <svg className="h-10 w-10 text-white animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          {/* Success Message */}
          <h3 className="text-3xl font-bold text-gray-900 mb-3 animate-fadeInUp">
            🎉 Success!
          </h3>
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Product added successfully:</p>
            <p className="font-bold text-lg text-green-600 bg-green-50 px-4 py-2 rounded-lg">
              "{productName}"
            </p>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              ✓ OK
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              🔄 Add Another
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InsertOne: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: 0,
    oldPrice: 0,
    description: '',
    size: 'M',
    images: [],
    category: '',
    inStock: true,
    brand: '',
    weight: 0,
    tags: [], // নতুন field
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [submittedProductName, setSubmittedProductName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tags এর জন্য additional states
  const [currentTag, setCurrentTag] = useState('');
  const [tagSuggestions] = useState([
    'trending', 'new arrival', 'bestseller', 'limited edition', 'premium',
    'sale', 'discount', 'featured', 'popular', 'exclusive'
  ]);

  const categories = [
    'Sarees & Traditional Wear',
    'Western Outfits',
    'Hijab & Modest Wear',
    'Jewelry & Accessories',
    'Punjabi & Kurta',
    'Shirts & Pants',
    'Casual Wear',
    'Accessories & Watches',
    'Smartphones',
    'Tablets',
    'Mobile Accessories',
    'Laptops',
    'Desktop Computers',
    'Computer Accessories',
    'Bedroom Furniture',
    'Living Room',
    'Kitchen & Dining',
    'Kitchen Appliances',
    'Cleaning Appliances',
    'Face Care',
    'Body Care',
    'Face Makeup',
    'Eye Makeup',
    'Gym Equipment',
    'Yoga & Meditation',
    'Cricket',
    'Football'
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];

  // Add tag function
  const addTag = () => {
    const tag = currentTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setCurrentTag('');
    }
  };

  // Remove tag function
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle tag input
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Add suggestion tag
  const addSuggestionTag = (tag: string) => {
    if (!formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
          ? parseFloat(value) || 0
          : value,
    }));
    
    if (error) setError(null);
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file processing
  const handleFiles = async (files: FileList) => {
    const MAX_FILES = 8;
    
    if (formData.images.length + files.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} images allowed.`);
      return;
    }

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} - Only image files allowed`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setError(invalidFiles.join(', '));
    }

    if (validFiles.length > 0) {
      setIsOptimizing(true);
      try {
        const optimizedFiles = await optimizeImages(validFiles, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.82,
          format: 'image/webp'
        });

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...optimizedFiles],
        }));
        
        const newPreviews = optimizedFiles.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...newPreviews]);
        
        if (invalidFiles.length === 0) {
          setError(null);
        }
      } catch (err) {
        console.error('Image optimization failed, fallback to original:', err);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...validFiles],
        }));
        
        const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...newPreviews]);
      } finally {
        setIsOptimizing(false);
      }
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // Remove an image from selection
  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setFormData((prev) => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      oldPrice: 0,
      description: '',
      size: 'M',
      images: [],
      category: '',
      inStock: true,
      brand: '',
      weight: 0,
      tags: [], // এই line add করুন
    });
    
    setCurrentTag(''); // এই line add করুন
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setImagePreviews([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validate inputs
    if (!formData.name.trim()) {
      setError('Product name is required.');
      setIsLoading(false);
      return;
    }

    if (!formData.price || formData.price <= 0) {
      setError('Please enter a valid price.');
      setIsLoading(false);
      return;
    }

    if (!formData.category) {
      setError('Please select a category.');
      setIsLoading(false);
      return;
    }

    if (formData.images.length === 0) {
      setError('Please upload at least one image.');
      setIsLoading(false);
      return;
    }

    if (formData.tags.length < 3) {
      setError('Please add at least 3 tags.');
      setIsLoading(false);
      return;
    }

    if (formData.oldPrice > 0 && formData.oldPrice <= formData.price) {
      setError('Old price must be higher than current price.');
      setIsLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formData.images.forEach((file) => {
      formDataToSend.append('images', file);
    });

    try {
      // Upload images first
      const imageUploadResponse = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/image`,
        formDataToSend
      );

      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        price: formData.price,
        oldPrice: formData.oldPrice,
        description: formData.description.trim(),
        size: formData.size,
        category: formData.category,
        inStock: formData.inStock,
        brand: formData.brand?.trim() || '',
        weight: formData.weight || 0,
        tags: formData.tags, // এই line add করুন
        images: imageUploadResponse.data.imageUrls,
      };

      // Insert product
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/products`, productData);

      setSubmittedProductName(formData.name);
      setShowSuccessPopup(true);
      resetForm();
      
    } catch (error: any) {
      console.error('Error adding product:', error);
      setError(
        error.response?.data?.message || 
        'Failed to add product. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate discount percentage
  const discountPercentage = formData.oldPrice > formData.price && formData.price > 0 
    ? Math.round(((formData.oldPrice - formData.price) / formData.oldPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
            Add New Product
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Add new products to your store and grow your business
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 p-4 m-6 rounded-xl">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-10">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 text-lg"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300"
                    placeholder="Brand name"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Pricing Information</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Current Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Current Price (৳) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-gray-500 text-lg">৳</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 text-lg"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Old Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Old Price (৳)
                    {discountPercentage > 0 && (
                      <span className="inline-block ml-2 px-3 py-1 text-xs bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full font-bold">
                        {discountPercentage}% OFF
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-gray-500 text-lg">৳</span>
                    <input
                      type="number"
                      name="oldPrice"
                      value={formData.oldPrice}
                      onChange={handleChange}
                      className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 text-lg"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Weight (grams)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300"
                      min="0"
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-4 text-gray-500 text-sm">grams</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Product Details</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Size */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Size
                  </label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300"
                  >
                    {sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock Status */}
                <div className="flex items-center justify-center">
                  <label className="flex items-center cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 rounded-2xl border-2 border-gray-200 hover:from-blue-50 hover:to-blue-100 hover:border-blue-300 transition-all duration-300">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={formData.inStock}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-semibold text-gray-700">
                      In Stock
                    </span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 resize-none"
                  placeholder="Enter detailed product description..."
                />
              </div>
            </div>

            {/* Tags Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-sm">4</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Tags</h3>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Product Tags * <span className="text-xs text-gray-500">(Maximum 10 tags, minimum 3 required)</span>
                </label>
                
                {/* Tag Input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300"
                    placeholder="Enter a tag and press Enter"
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!currentTag.trim() || formData.tags.length >= 10}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>

                {/* Tag Suggestions */}
                {tagSuggestions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {tagSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => addSuggestionTag(suggestion)}
                          disabled={formData.tags.includes(suggestion) || formData.tags.length >= 10}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-full border border-gray-200 hover:border-blue-300 transition-all duration-200 disabled:cursor-not-allowed"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Tags Display */}
                {formData.tags.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-600">
                        Selected Tags ({formData.tags.length}/10)
                      </p>
                      {formData.tags.length < 3 && (
                        <span className="text-xs text-red-500 font-medium">
                          Add at least {3 - formData.tags.length} more tag{3 - formData.tags.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200 group hover:from-blue-100 hover:to-blue-200 transition-all duration-200"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 hover:text-red-600 font-bold text-lg transition-colors duration-200"
                            title="Remove tag"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">5</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Upload Images</h3>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Product Images * <span className="text-xs text-gray-500">(Maximum 8 images, each under 5MB)</span>
                </label>
                <div 
                  className={`border-3 border-dashed rounded-3xl p-8 text-center transition-all duration-300 ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    ref={fileInputRef}
                    id="imageUpload"
                  />
                  <label htmlFor="imageUpload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-xl font-bold text-gray-700 mb-2">Upload Images</p>
                      <p className="text-gray-500 mb-2">Click or drag and drop here</p>
                      <p className="text-sm text-blue-600 font-medium">Auto-compressed to high-speed WebP - Max 8 images</p>
                    </div>
                  </label>
                </div>

                {/* Optimizing State Indicator */}
                {isOptimizing && (
                  <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600 font-medium py-2 px-4 bg-blue-50 rounded-xl">
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Optimizing image resolution & compressing to WebP for best performance...</span>
                  </div>
                )}
                
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-gray-700">
                        Uploaded Images ({imagePreviews.length}/8)
                      </p>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(imagePreviews.length / 8) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-xl border-2 border-gray-200 group-hover:border-blue-400 transition-all duration-300 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg transform hover:scale-110"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-8 border-t border-gray-200">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 hover:from-blue-700 hover:via-purple-700 hover:to-blue-900 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-400 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center transform hover:scale-[1.02] disabled:transform-none shadow-xl text-lg"
                disabled={isLoading || isOptimizing}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="animate-pulse">Uploading...</span>
                  </>
                ) : isOptimizing ? (
                  <span>Optimizing Images...</span>
                ) : (
                  <>
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        productName={submittedProductName}
      />
    </div>
  );
};

export default InsertOne;