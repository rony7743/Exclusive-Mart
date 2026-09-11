import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useRef } from "react";

const Step2: React.FC = () => {
  const { setAuthData } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, or WEBP images are allowed");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be less than 5MB");
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      navigate("/step3"); // Skip if no file selected
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("images", selectedFile);

    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/image`, formData);

      const imageUrls = response.data.imageUrls;
      setAuthData((prev) => ({ ...prev, imgUrl: imageUrls[0] }));
      navigate("/step3");
    } catch (err) {
      setError("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Profile Picture</h2>
      <p className="text-gray-600 mb-6 text-center">
        Upload a profile picture (Optional)
      </p>

      {/* Image upload area */}
      <div className="mb-6">
        {preview ? (
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-40 h-40 rounded-full object-cover border-4 border-blue-100"
              />
              <button
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={triggerFileSelect}
            className="border-2 border-dashed border-gray-300 rounded-full w-40 h-40 mx-auto flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
          >
            <div className="text-center p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-500 mt-2">Click to upload</p>
            </div>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="mb-4 text-center text-red-500 text-sm">{error}</div>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={() => navigate("/signup")}
          className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        
        <div className="space-x-3">
          <button
            onClick={() => navigate("/step3")}
            className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Skip
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className={`px-6 py-2 rounded-lg text-white ${
              isUploading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isUploading ? "Uploading..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2;