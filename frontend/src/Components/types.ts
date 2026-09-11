export interface UserInfos {
  _id: string;
  name: string;
  email: string;
  imgUrl?: string;
}

export interface Reviews {
  _id: string;
  userId: UserInfos;
  productId: string;
  rating: number;
  review: string;
  likes: number;
  createdAt: string;
}

export interface Products {
  _id: string;
  name: string;
  price: number;
  oldPrice: number;
  description: string;
  images: string[];
  discount: number;
  category: string;
  inStock: boolean;
  createdAt: string;
  reviews: Reviews[];
}