import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';

interface RatingProps {
  productId: string;
  initialRating?: number;
  totalReviews?: number;
  isSmall?: boolean;
}

const fetchRating = async (productId: string) => {
  const baseUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:3001';
  const res = await fetch(`${baseUrl}/api/getrating/${productId}`);
  const data = await res.json();
  if (data && typeof data.averageRating === 'number' && typeof data.totalReviews === 'number') {
    return { averageRating: data.averageRating, totalReviews: data.totalReviews };
  }
  throw new Error('Invalid rating data');
};

const Rating = ({ productId, initialRating, totalReviews, isSmall = false }: RatingProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['rating', productId],
    queryFn: () => fetchRating(productId),
    staleTime: 5 * 60 * 1000,
    // যদি initialRating থাকে তাহলে সেটা দিয়ে initialize করুন
    initialData: initialRating !== undefined && totalReviews !== undefined 
      ? { averageRating: initialRating, totalReviews } 
      : undefined,
  });

  if (isLoading) {
    return <p className={`text-gray-400 ${isSmall ? 'text-xs' : 'text-sm'}`}>Loading rating...</p>;
  }

  if (error) {
    return <p className={`text-red-500 ${isSmall ? 'text-xs' : 'text-sm'}`}>Failed to load rating</p>;
  }

  return (
    <div className={`flex items-center gap-1 text-yellow-500 ${isSmall ? 'text-sm' : ''}`}>
      {[...Array(5)].map((_, i) => (
        <span key={i}>
          {i < Math.round(data?.averageRating || 0) ? '★' : '☆'}
        </span>
      ))}
      <span className={`text-gray-500 ${isSmall ? 'text-xs' : 'text-sm'}`}>
        ({data?.totalReviews || 0})
      </span>
    </div>
  );
};

export default memo(Rating);