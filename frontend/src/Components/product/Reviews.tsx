import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaStar, FaThumbsUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Review type with like field and user like tracking
interface ReviewType {
  _id: string;
  rating: number;
  review: string;
  userId: { _id: string; name: string; imgUrl?: string } | null;
  productId: string;
  user: string;
  likes: number;
  likedBy: string[]; // Users who have liked
}

interface Props {
  productId: string;
  currentUserId: string;
  currentUserName: string;
}

const Reviews: React.FC<Props> = ({ productId, currentUserId, currentUserName }) => {
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const navigate = useNavigate();

  // Fetch reviews and ratings
  const fetchReviews = async (reset: boolean = false) => {
    if (!hasMore && !reset) return;

    setLoading(true);
    setError(null);
    try {
      const pageToFetch = reset ? 1 : page;
      const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/getreviews/${productId}?page=${pageToFetch}&limit=10`);
      const res2 = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/getrating/${productId}`);
      // Ensure likedBy field defaults to array
      const newReviews = Array.isArray(res.data)
        ? res.data.map((rev: ReviewType) => ({
            ...rev,
            likedBy: Array.isArray(rev.likedBy) ? rev.likedBy : [], // Default empty array
          }))
        : [];
      setReviews(prev => (reset ? newReviews : [...prev, ...newReviews]));
      setHasMore(newReviews.length === 10);
      setTotalReviews(res2.data.totalReviews);
      setAverageRating(res2.data.averageRating);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Failed to load reviews. Please try again.");
      toast.error("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  // Submit review
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast.error("Review text cannot be empty.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/reviews`, {
        rating,
        review: reviewText,
        userId: currentUserId,
        productId,
        user: currentUserName,
      });
      toast.success("Review submitted successfully!");
      setReviewText("");
      setRating(5);
      setPage(1);
      fetchReviews(true);
    } catch (error) {
      console.error("Error submitting review:", error);
      setError("Failed to submit review. Please try again.");
      toast.error("Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  // Like handler
  const handleLike = async (reviewId: string, isLiked: boolean) => {
    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/like/${reviewId}`, {
        userId: currentUserId,
        action: isLiked ? "unlike" : "like",
      });
      setReviews(prev =>
        prev.map(rev =>
          rev._id === reviewId
            ? {
                ...rev,
                likes: isLiked ? rev.likes - 1 : rev.likes + 1,
                likedBy: isLiked
                  ? rev.likedBy.filter(id => id !== currentUserId)
                  : [...rev.likedBy, currentUserId],
              }
            : rev
        )
      );
      toast.success(isLiked ? "Like removed!" : "Liked!");
    } catch (error) {
      console.error("Error processing like:", error);
      toast.error("Failed to like.");
    }
  };

  // Load more reviews
  const loadMoreReviews = () => {
    setPage(prev => prev + 1);
  };

  // Handle fetching
  useEffect(() => {
    fetchReviews(page === 1);
  }, [productId, page]);

  return (
    <div className=" px-4 py-8 max-w-4xl">
      {/* Total reviews and average rating */}
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
        Customer Reviews ({totalReviews})
      </h2>
      <div className="mb-6 flex items-center gap-2">
        <span className="text-lg font-semibold">Average Rating:</span>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}
            />
          ))}
          <span>({averageRating.toFixed(2)})</span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          {error}
        </div>
      )}

      {/* Review form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="reviewText" className="block text-gray-700 font-semibold mb-2">
            Your Review
          </label>
          <textarea
            id="reviewText"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your review here..."
            rows={4}
            required
            disabled={loading}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <label htmlFor="rating" className="text-gray-700 font-semibold">
            Rating:
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((r) => (
              <FaStar
                key={r}
                className={`cursor-pointer ${r <= rating ? "text-yellow-400" : "text-gray-300"}`}
                onClick={() => setRating(r)}
              />
            ))}
          </div>
          <button
            type="submit"
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>

      {/* Review list */}
      <div className="space-y-6">
        {loading && !reviews.length ? (
          <div className="text-center text-gray-600 ">
            <svg
              className="animate-spin h-5 w-5 mx-auto text-blue-600"
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
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-gray-600">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((rev) => {
            const reviewerId = rev.userId?._id;
            const reviewerName = rev.userId?.name || rev.user || "Unknown User";
            const reviewerImg = rev.userId?.imgUrl || "https://placehold.co/50x50";

            return (
            <div
              key={rev._id}
              className="hover:bg-gray-100 bg-white shadow-md rounded-lg p-6 flex flex-col sm:flex-row gap-4 border-b"
              onClick={() => {
                if (reviewerId) navigate(`/messages/viewprofile/${reviewerId}`);
              }}
            >
              <div className="flex-shrink-0">
                <img
                  src={reviewerImg}
                  alt={reviewerName}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => (e.currentTarget.src = "https://placehold.co/50x50")}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-semibold">{reviewerName}</p>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < rev.rating ? "text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <p className="text-gray-800">{rev.review}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(rev._id, rev.likedBy.includes(currentUserId));
                    }}
                    className={`flex items-center gap-1 text-sm ${
                      rev.likedBy.includes(currentUserId) ? "text-blue-600" : "text-gray-600"
                    } hover:text-blue-700`}
                    disabled={loading}
                  >
                    <FaThumbsUp />
                    <span>{rev.likes} Likes</span>
                  </button>
                </div>
              </div>
            </div>
          )})
        )}

        {hasMore && (
          <div className="text-center mt-6">
            <button
              onClick={loadMoreReviews}
              className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More Reviews"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
