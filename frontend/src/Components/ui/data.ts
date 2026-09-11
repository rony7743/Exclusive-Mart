export interface SearchItem {
  id: string;
  label: string;
  searchTags: string[];
  categoryId: string;
  categoryLabel: string;
  subcategoryId: string;
  subcategoryLabel: string;
  icon: string;
}

export const flatItems: SearchItem[] = [
  // Fashion > Women's Fashion
  {
    id: 'saree',
    label: 'Sarees & Traditional Wear',
    searchTags: ['saree', 'traditional', 'ethnic'],
    categoryId: 'fashion',
    categoryLabel: 'Fashion & Clothing',
    subcategoryId: 'women',
    subcategoryLabel: "Women's Fashion",
    icon: '👗'
  },
  {
    id: 'western-women',
    label: 'Western Outfits',
    searchTags: ['western', 'dress', 'top', 'jeans'],
    categoryId: 'fashion',
    categoryLabel: 'Fashion & Clothing',
    subcategoryId: 'women',
    subcategoryLabel: "Women's Fashion",
    icon: '👗'
  },
  {
    id: 'hijab',
    label: 'Hijab & Modest Wear',
    searchTags: ['hijab', 'islamic', 'modest', 'abaya'],
    categoryId: 'fashion',
    categoryLabel: 'Fashion & Clothing',
    subcategoryId: 'women',
    subcategoryLabel: "Women's Fashion",
    icon: '👗'
  },
  {
    id: 'accessories-women',
    label: 'Jewelry & Accessories',
    searchTags: ['jewelry', 'accessories', 'bags', 'shoes'],
    categoryId: 'fashion',
    categoryLabel: 'Fashion & Clothing',
    subcategoryId: 'women',
    subcategoryLabel: "Women's Fashion",
    icon: '💎'
  },

  // Fashion > Men's Fashion
  {
    id: 'punjabi',
    label: 'Punjabi & Kurta',
    searchTags: ['punjabi', 'kurta', 'traditional', 'ethnic'],
    categoryId: 'fashion',
    categoryLabel: 'Fashion & Clothing',
    subcategoryId: 'men',
    subcategoryLabel: "Men's Fashion",
    icon: '👔'
  },
  {
    id: 'shirt-pant',
    label: 'Shirts & Pants',
    searchTags: ['shirt', 'pant', 'formal', 'office'],
    categoryId: 'fashion',
    categoryLabel: 'Fashion & Clothing',
    subcategoryId: 'men',
    subcategoryLabel: "Men's Fashion",
    icon: '👔'
  },
  {
    id: 'casual-men',
    label: 'Casual Wear',
    searchTags: ['casual', 't-shirt', 'polo', 'shorts'],
    categoryId: 'fashion',
    categoryLabel: 'Fashion & Clothing',
    subcategoryId: 'men',
    subcategoryLabel: "Men's Fashion",
    icon: '👕'
  },
  {
    id: 'accessories-men',
    label: 'Accessories & Watches',
    searchTags: ['watch', 'belt', 'wallet', 'accessories'],
    categoryId: 'fashion',
    categoryLabel: 'Fashion & Clothing',
    subcategoryId: 'men',
    subcategoryLabel: "Men's Fashion",
    icon: '⌚'
  },

  // Fashion > Kids Fashion
  {
    id: 'kids-boys',
    label: 'Boys Clothing',
    searchTags: ['boys', 'kids', 'children', 'shirt', 'pant'],
    categoryId: 'fashion',
    categoryLabel: 'Fashion & Clothing',
    subcategoryId: 'kids',
    subcategoryLabel: "Kids Fashion",
    icon: '👦'
  },
  {
    id: 'kids-girls',
    label: 'Girls Clothing',
    searchTags: ['girls', 'kids', 'children', 'dress', 'frock'],
    categoryId: 'fashion',
    categoryLabel: 'Fashion & Clothing',
    subcategoryId: 'kids',
    subcategoryLabel: "Kids Fashion",
    icon: '👧'
  },
  {
    id: 'kids-accessories',
    label: 'Kids Accessories',
    searchTags: ['kids', 'accessories', 'shoes', 'bags', 'toys'],
    categoryId: 'fashion',
    categoryLabel: 'Fashion & Clothing',
    subcategoryId: 'kids',
    subcategoryLabel: "Kids Fashion",
    icon: '🎒'
  },

  // Electronics > Mobile
  {
    id: 'smartphones',
    label: 'Smartphones',
    searchTags: ['phone', 'mobile', 'android', 'iphone', 'samsung'],
    categoryId: 'electronics',
    categoryLabel: 'Electronics',
    subcategoryId: 'mobile',
    subcategoryLabel: 'Mobile & Tablets',
    icon: '📱'
  },
  {
    id: 'tablets',
    label: 'Tablets',
    searchTags: ['tablet', 'ipad', 'android-tablet', 'tab'],
    categoryId: 'electronics',
    categoryLabel: 'Electronics',
    subcategoryId: 'mobile',
    subcategoryLabel: 'Mobile & Tablets',
    icon: '📱'
  },
  {
    id: 'accessories-mobile',
    label: 'Mobile Accessories',
    searchTags: ['case', 'charger', 'headphones', 'screen-protector', 'powerbank'],
    categoryId: 'electronics',
    categoryLabel: 'Electronics',
    subcategoryId: 'mobile',
    subcategoryLabel: 'Mobile & Tablets',
    icon: '🔌'
  },

  // Electronics > Computers
  {
    id: 'laptops',
    label: 'Laptops',
    searchTags: ['laptop', 'notebook', 'gaming-laptop', 'macbook'],
    categoryId: 'electronics',
    categoryLabel: 'Electronics',
    subcategoryId: 'computers',
    subcategoryLabel: 'Computers & Laptops',
    icon: '💻'
  },
  {
    id: 'desktops',
    label: 'Desktop Computers',
    searchTags: ['desktop', 'pc', 'gaming-pc', 'workstation'],
    categoryId: 'electronics',
    categoryLabel: 'Electronics',
    subcategoryId: 'computers',
    subcategoryLabel: 'Computers & Laptops',
    icon: '🖥️'
  },
  {
    id: 'accessories-computer',
    label: 'Computer Accessories',
    searchTags: ['keyboard', 'mouse', 'monitor', 'speaker', 'webcam'],
    categoryId: 'electronics',
    categoryLabel: 'Electronics',
    subcategoryId: 'computers',
    subcategoryLabel: 'Computers & Laptops',
    icon: '⌨️'
  },

  // Electronics > Gaming
  {
    id: 'gaming-consoles',
    label: 'Gaming Consoles',
    searchTags: ['playstation', 'xbox', 'nintendo', 'console', 'gaming'],
    categoryId: 'electronics',
    categoryLabel: 'Electronics',
    subcategoryId: 'gaming',
    subcategoryLabel: 'Gaming',
    icon: '🎮'
  },
  {
    id: 'gaming-accessories',
    label: 'Gaming Accessories',
    searchTags: ['controller', 'gaming-chair', 'headset', 'gaming-keyboard'],
    categoryId: 'electronics',
    categoryLabel: 'Electronics',
    subcategoryId: 'gaming',
    subcategoryLabel: 'Gaming',
    icon: '🕹️'
  },

  // Electronics > Audio & Video
  {
    id: 'headphones',
    label: 'Headphones & Earphones',
    searchTags: ['headphones', 'earphones', 'bluetooth', 'wireless', 'airpods'],
    categoryId: 'electronics',
    categoryLabel: 'Electronics',
    subcategoryId: 'audio',
    subcategoryLabel: 'Audio & Video',
    icon: '🎧'
  },
  {
    id: 'speakers',
    label: 'Speakers',
    searchTags: ['speaker', 'bluetooth-speaker', 'soundbar', 'home-theater'],
    categoryId: 'electronics',
    categoryLabel: 'Electronics',
    subcategoryId: 'audio',
    subcategoryLabel: 'Audio & Video',
    icon: '🔊'
  },
  {
    id: 'tv',
    label: 'Television',
    searchTags: ['tv', 'television', 'smart-tv', 'led', 'oled'],
    categoryId: 'electronics',
    categoryLabel: 'Electronics',
    subcategoryId: 'audio',
    subcategoryLabel: 'Audio & Video',
    icon: '📺'
  },

  // Home > Furniture
  {
    id: 'bedroom',
    label: 'Bedroom Furniture',
    searchTags: ['bed', 'mattress', 'wardrobe', 'dresser', 'nightstand'],
    categoryId: 'home',
    categoryLabel: 'Home & Lifestyle',
    subcategoryId: 'furniture',
    subcategoryLabel: 'Furniture',
    icon: '🛏️'
  },
  {
    id: 'living-room',
    label: 'Living Room',
    searchTags: ['sofa', 'chair', 'table', 'tv-stand', 'coffee-table'],
    categoryId: 'home',
    categoryLabel: 'Home & Lifestyle',
    subcategoryId: 'furniture',
    subcategoryLabel: 'Furniture',
    icon: '🛋️'
  },
  {
    id: 'kitchen-furniture',
    label: 'Kitchen & Dining',
    searchTags: ['dining-table', 'kitchen-cabinet', 'bar-stool', 'dining-chair'],
    categoryId: 'home',
    categoryLabel: 'Home & Lifestyle',
    subcategoryId: 'furniture',
    subcategoryLabel: 'Furniture',
    icon: '🪑'
  },
  {
    id: 'office-furniture',
    label: 'Office Furniture',
    searchTags: ['office-chair', 'desk', 'bookshelf', 'filing-cabinet'],
    categoryId: 'home',
    categoryLabel: 'Home & Lifestyle',
    subcategoryId: 'furniture',
    subcategoryLabel: 'Furniture',
    icon: '🪑'
  },

  // Home > Appliances
  {
    id: 'kitchen-appliances',
    label: 'Kitchen Appliances',
    searchTags: ['refrigerator', 'microwave', 'blender', 'rice-cooker', 'oven'],
    categoryId: 'home',
    categoryLabel: 'Home & Lifestyle',
    subcategoryId: 'appliances',
    subcategoryLabel: 'Home Appliances',
    icon: '🍳'
  },
  {
    id: 'cleaning',
    label: 'Cleaning Appliances',
    searchTags: ['vacuum', 'washing-machine', 'iron', 'dishwasher'],
    categoryId: 'home',
    categoryLabel: 'Home & Lifestyle',
    subcategoryId: 'appliances',
    subcategoryLabel: 'Home Appliances',
    icon: '🧹'
  },
  {
    id: 'air-conditioning',
    label: 'Air Conditioning',
    searchTags: ['ac', 'air-conditioner', 'fan', 'cooler', 'heater'],
    categoryId: 'home',
    categoryLabel: 'Home & Lifestyle',
    subcategoryId: 'appliances',
    subcategoryLabel: 'Home Appliances',
    icon: '❄️'
  },

  // Home > Decor
  {
    id: 'wall-decor',
    label: 'Wall Decoration',
    searchTags: ['painting', 'wall-art', 'mirror', 'clock', 'poster'],
    categoryId: 'home',
    categoryLabel: 'Home & Lifestyle',
    subcategoryId: 'decor',
    subcategoryLabel: 'Home Decor',
    icon: '🖼️'
  },
  {
    id: 'lighting',
    label: 'Lighting',
    searchTags: ['lamp', 'ceiling-light', 'led', 'chandelier', 'bulb'],
    categoryId: 'home',
    categoryLabel: 'Home & Lifestyle',
    subcategoryId: 'decor',
    subcategoryLabel: 'Home Decor',
    icon: '💡'
  },
  {
    id: 'curtains',
    label: 'Curtains & Blinds',
    searchTags: ['curtain', 'blind', 'drape', 'window-covering'],
    categoryId: 'home',
    categoryLabel: 'Home & Lifestyle',
    subcategoryId: 'decor',
    subcategoryLabel: 'Home Decor',
    icon: '🪟'
  },

  // Health > Skincare
  {
    id: 'face-care',
    label: 'Face Care',
    searchTags: ['face-wash', 'moisturizer', 'serum', 'sunscreen', 'toner'],
    categoryId: 'health',
    categoryLabel: 'Health & Beauty',
    subcategoryId: 'skincare',
    subcategoryLabel: 'Skincare',
    icon: '🧴'
  },
  {
    id: 'body-care',
    label: 'Body Care',
    searchTags: ['body-lotion', 'soap', 'shower-gel', 'body-wash'],
    categoryId: 'health',
    categoryLabel: 'Health & Beauty',
    subcategoryId: 'skincare',
    subcategoryLabel: 'Skincare',
    icon: '🧼'
  },
  {
    id: 'hair-care',
    label: 'Hair Care',
    searchTags: ['shampoo', 'conditioner', 'hair-oil', 'hair-mask'],
    categoryId: 'health',
    categoryLabel: 'Health & Beauty',
    subcategoryId: 'skincare',
    subcategoryLabel: 'Skincare',
    icon: '💇'
  },

  // Health > Makeup
  {
    id: 'face-makeup',
    label: 'Face Makeup',
    searchTags: ['foundation', 'concealer', 'powder', 'blush', 'highlighter'],
    categoryId: 'health',
    categoryLabel: 'Health & Beauty',
    subcategoryId: 'makeup',
    subcategoryLabel: 'Makeup',
    icon: '💄'
  },
  {
    id: 'eye-makeup',
    label: 'Eye Makeup',
    searchTags: ['eyeshadow', 'mascara', 'eyeliner', 'eyebrow', 'kajal'],
    categoryId: 'health',
    categoryLabel: 'Health & Beauty',
    subcategoryId: 'makeup',
    subcategoryLabel: 'Makeup',
    icon: '👁️'
  },
  {
    id: 'lip-makeup',
    label: 'Lip Makeup',
    searchTags: ['lipstick', 'lip-gloss', 'lip-balm', 'lip-liner'],
    categoryId: 'health',
    categoryLabel: 'Health & Beauty',
    subcategoryId: 'makeup',
    subcategoryLabel: 'Makeup',
    icon: '💋'
  },

  // Health > Personal Care
  {
    id: 'oral-care',
    label: 'Oral Care',
    searchTags: ['toothpaste', 'toothbrush', 'mouthwash', 'dental'],
    categoryId: 'health',
    categoryLabel: 'Health & Beauty',
    subcategoryId: 'personal-care',
    subcategoryLabel: 'Personal Care',
    icon: '🦷'
  },
  {
    id: 'feminine-care',
    label: 'Feminine Care',
    searchTags: ['sanitary-pad', 'tampon', 'feminine-hygiene'],
    categoryId: 'health',
    categoryLabel: 'Health & Beauty',
    subcategoryId: 'personal-care',
    subcategoryLabel: 'Personal Care',
    icon: '🌸'
  },

  // Sports > Fitness
  {
    id: 'gym-equipment',
    label: 'Gym Equipment',
    searchTags: ['dumbbell', 'treadmill', 'exercise-bike', 'weight', 'barbell'],
    categoryId: 'sports',
    categoryLabel: 'Sports & Outdoor',
    subcategoryId: 'fitness',
    subcategoryLabel: 'Fitness Equipment',
    icon: '🏋️'
  },
  {
    id: 'yoga',
    label: 'Yoga & Meditation',
    searchTags: ['yoga-mat', 'meditation', 'pilates', 'yoga-block'],
    categoryId: 'sports',
    categoryLabel: 'Sports & Outdoor',
    subcategoryId: 'fitness',
    subcategoryLabel: 'Fitness Equipment',
    icon: '🧘'
  },
  {
    id: 'fitness-wear',
    label: 'Fitness Wear',
    searchTags: ['gym-wear', 'sports-bra', 'leggings', 'track-suit'],
    categoryId: 'sports',
    categoryLabel: 'Sports & Outdoor',
    subcategoryId: 'fitness',
    subcategoryLabel: 'Fitness Equipment',
    icon: '👟'
  },

  // Sports > Outdoor
  {
    id: 'cricket',
    label: 'Cricket',
    searchTags: ['cricket-bat', 'ball', 'helmet', 'pads', 'wicket'],
    categoryId: 'sports',
    categoryLabel: 'Sports & Outdoor',
    subcategoryId: 'outdoor',
    subcategoryLabel: 'Outdoor Sports',
    icon: '🏏'
  },
  {
    id: 'football',
    label: 'Football',
    searchTags: ['football', 'soccer', 'boots', 'jersey', 'goal'],
    categoryId: 'sports',
    categoryLabel: 'Sports & Outdoor',
    subcategoryId: 'outdoor',
    subcategoryLabel: 'Outdoor Sports',
    icon: '⚽'
  },
  {
    id: 'badminton',
    label: 'Badminton',
    searchTags: ['badminton-racket', 'shuttlecock', 'net', 'grip'],
    categoryId: 'sports',
    categoryLabel: 'Sports & Outdoor',
    subcategoryId: 'outdoor',
    subcategoryLabel: 'Outdoor Sports',
    icon: '🏸'
  },
  {
    id: 'cycling',
    label: 'Cycling',
    searchTags: ['bicycle', 'bike', 'helmet', 'cycling-gear'],
    categoryId: 'sports',
    categoryLabel: 'Sports & Outdoor',
    subcategoryId: 'outdoor',
    subcategoryLabel: 'Outdoor Sports',
    icon: '🚴'
  },

  // Books > Educational
  {
    id: 'academic-books',
    label: 'Academic Books',
    searchTags: ['textbook', 'academic', 'study', 'education'],
    categoryId: 'books',
    categoryLabel: 'Books & Education',
    subcategoryId: 'educational',
    subcategoryLabel: 'Educational Books',
    icon: '📚'
  },
  {
    id: 'competitive-exam',
    label: 'Competitive Exam Books',
    searchTags: ['bcs', 'job-exam', 'bank-job', 'govt-job'],
    categoryId: 'books',
    categoryLabel: 'Books & Education',
    subcategoryId: 'educational',
    subcategoryLabel: 'Educational Books',
    icon: '📖'
  },
  {
    id: 'language-learning',
    label: 'Language Learning',
    searchTags: ['english', 'bangla', 'arabic', 'language'],
    categoryId: 'books',
    categoryLabel: 'Books & Education',
    subcategoryId: 'educational',
    subcategoryLabel: 'Educational Books',
    icon: '🗣️'
  },

  // Books > Fiction
  {
    id: 'novels',
    label: 'Novels',
    searchTags: ['novel', 'fiction', 'story', 'bangla-novel'],
    categoryId: 'books',
    categoryLabel: 'Books & Education',
    subcategoryId: 'fiction',
    subcategoryLabel: 'Fiction Books',
    icon: '📗'
  },
  {
    id: 'poetry',
    label: 'Poetry',
    searchTags: ['poem', 'poetry', 'kobita', 'verse'],
    categoryId: 'books',
    categoryLabel: 'Books & Education',
    subcategoryId: 'fiction',
    subcategoryLabel: 'Fiction Books',
    icon: '📝'
  },

  // Food > Groceries
  {
    id: 'rice-grains',
    label: 'Rice & Grains',
    searchTags: ['rice', 'basmati', 'lentil', 'dal', 'wheat'],
    categoryId: 'food',
    categoryLabel: 'Food & Beverages',
    subcategoryId: 'groceries',
    subcategoryLabel: 'Groceries',
    icon: '🌾'
  },
  {
    id: 'spices',
    label: 'Spices & Seasonings',
    searchTags: ['spice', 'masala', 'salt', 'turmeric', 'chili'],
    categoryId: 'food',
    categoryLabel: 'Food & Beverages',
    subcategoryId: 'groceries',
    subcategoryLabel: 'Groceries',
    icon: '🌶️'
  },
  {
    id: 'oil-ghee',
    label: 'Oil & Ghee',
    searchTags: ['oil', 'ghee', 'mustard-oil', 'coconut-oil'],
    categoryId: 'food',
    categoryLabel: 'Food & Beverages',
    subcategoryId: 'groceries',
    subcategoryLabel: 'Groceries',
    icon: '🫒'
  },

  // Food > Snacks
  {
    id: 'biscuits',
    label: 'Biscuits & Cookies',
    searchTags: ['biscuit', 'cookie', 'cracker', 'wafer'],
    categoryId: 'food',
    categoryLabel: 'Food & Beverages',
    subcategoryId: 'snacks',
    subcategoryLabel: 'Snacks & Sweets',
    icon: '🍪'
  },
  {
    id: 'sweets',
    label: 'Traditional Sweets',
    searchTags: ['mishti', 'rasgulla', 'sandesh', 'sweet'],
    categoryId: 'food',
    categoryLabel: 'Food & Beverages',
    subcategoryId: 'snacks',
    subcategoryLabel: 'Snacks & Sweets',
    icon: '🍯'
  },

  // Baby > Care
  {
    id: 'baby-food',
    label: 'Baby Food',
    searchTags: ['baby-food', 'formula', 'cerelac', 'baby-nutrition'],
    categoryId: 'baby',
    categoryLabel: 'Baby & Kids',
    subcategoryId: 'care',
    subcategoryLabel: 'Baby Care',
    icon: '🍼'
  },
  {
    id: 'diapers',
    label: 'Diapers & Wipes',
    searchTags: ['diaper', 'baby-wipe', 'pampers', 'huggies'],
    categoryId: 'baby',
    categoryLabel: 'Baby & Kids',
    subcategoryId: 'care',
    subcategoryLabel: 'Baby Care',
    icon: '👶'
  },
  {
    id: 'baby-clothes',
    label: 'Baby Clothes',
    searchTags: ['baby-dress', 'onesie', 'baby-shirt', 'baby-pant'],
    categoryId: 'baby',
    categoryLabel: 'Baby & Kids',
    subcategoryId: 'care',
    subcategoryLabel: 'Baby Care',
    icon: '👕'
  },

  // Baby > Toys
  {
    id: 'educational-toys',
    label: 'Educational Toys',
    searchTags: ['educational-toy', 'puzzle', 'learning-toy', 'blocks'],
    categoryId: 'baby',
    categoryLabel: 'Baby & Kids',
    subcategoryId: 'toys',
    subcategoryLabel: 'Toys & Games',
    icon: '🧩'
  },
  {
    id: 'soft-toys',
    label: 'Soft Toys',
    searchTags: ['teddy-bear', 'soft-toy', 'plush', 'stuffed-animal'],
    categoryId: 'baby',
    categoryLabel: 'Baby & Kids',
    subcategoryId: 'toys',
    subcategoryLabel: 'Toys & Games',
    icon: '🧸'
  },

  // Automotive > Parts
  {
    id: 'car-parts',
    label: 'Car Parts',
    searchTags: ['car-part', 'engine', 'brake', 'tire', 'battery'],
    categoryId: 'automotive',
    categoryLabel: 'Automotive',
    subcategoryId: 'parts',
    subcategoryLabel: 'Auto Parts',
    icon: '🔧'
  },
  {
    id: 'car-accessories',
    label: 'Car Accessories',
    searchTags: ['car-cover', 'seat-cover', 'car-mat', 'air-freshener'],
    categoryId: 'automotive',
    categoryLabel: 'Automotive',
    subcategoryId: 'parts',
    subcategoryLabel: 'Auto Parts',
    icon: '🚗'
  },

  // Automotive > Motorcycles
  {
    id: 'motorcycle-parts',
    label: 'Motorcycle Parts',
    searchTags: ['bike-part', 'motorcycle', 'helmet', 'bike-tire'],
    categoryId: 'automotive',
    categoryLabel: 'Automotive',
    subcategoryId: 'motorcycle',
    subcategoryLabel: 'Motorcycles',
    icon: '🏍️'
  }
];