const rateLimit = require('express-rate-limit');
require('dotenv').config();
const User = require('../model/UserModel');
const Product = require('../model/productsModel');
const Review = require('../model/Review');
const Order = require('../model/Order');
const Address = require('../model/addressModel');

const makeAdminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    error: true,
    message: 'You can only request admin access 5 times per hour. Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

exports.reqmakeadmin = [
  makeAdminLimiter,
  async (req, res) => {
    try {
      const code = req.body.code;
      const userId = req.user._id;
      const AdminSecret = process.env.ADMIN_SECRET;

      if (!code) {
        return res.status(400).json({
          error: true,
          message: 'Secret code is required.'
        });
      }

      if (!AdminSecret) {
        return res.status(500).json({
          error: true,
          message: 'Admin secret code is not set. Please contact support.'
        });
      }

      if (!userId) {
        return res.status(401).json({
          error: true,
          message: 'Unauthorized request. Please log in.'
        });
      }

      if (code !== AdminSecret) {
        return res.status(403).json({
          error: true,
          message: 'Invalid secret code. Please provide the correct code.'
        });
      }

      const user = await User.findByIdAndUpdate(
        userId, 
        { role: 'admin' }, 
        { new: true }
      );

      if (!user) { // user existence check
        return res.status(404).json({
          error: true,
          message: 'User not found.'
        });
      }

      res.status(200).json({
        error: false,
        message: 'You have successfully become an admin.',

      });

    } catch (error) {
      console.error('Error in reqmakeadmin:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Please try again later.'
      });
    }
  }
];


exports.fetchUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const filter = { role: 'user' };
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { email: regex }
      ];
    }

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);
    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select('name email role createdAt updatedAt imgUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      error: false,
      users,
      totalUsers,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error while fetching users.'
    });
  }
};




exports.fetchAllProducts = async (req, res) => {
  try{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);


const products = await Product.find()
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .select('name price oldPrice description images discount category inStock createdAt');

const reviews = await Review.find({ productId: { $in: products.map(p => p._id) } })
  .select('userId productId rating review likes createdAt')
  .populate('userId', 'name email imgUrl');

const productsWithReviews = products.map(product => {
  const productReviews = reviews.filter(r => r.productId.toString() === product._id.toString());
  return {
    ...product.toObject(),
    reviews: productReviews
  };
});

res.status(200).json({
  error: false,
  message: 'Products fetched successfully.',
  data: {
    products: productsWithReviews,
    totalPages,
    totalProducts,
    currentPage: page
  }
});
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error while fetching products.'
    });
  }
};




// ...existing code...
exports.fetchOrders = async (req, res) => {
  try {
    //fetch per 50 orders per page
    const page = parseInt(req.query.page) || 1;
    const limit = 50; // Fixed limit of 50 orders per page
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);

    const ordersFromDB = await Order.find()
      .populate('userId', 'name email imgUrl')
      .populate({
        path: 'product.productId',
        select: 'name price oldPrice images discount category inStock createdAt'
      })
      .populate('addressId') 
      .sort({ createdAt: -1 })
      .skip(skip) 
      .limit(limit) 
      .lean(); 
    const formattedOrders = ordersFromDB.map(order => {
      const productDetails = order.product && order.product.productId ? {
        productName: order.product.productId.name,
        productPrice: order.product.productId.price,
        productOldPrice: order.product.productId.oldPrice,
        productImages: order.product.productId.images,
        productDiscount: order.product.productId.discount,
        productCategory: order.product.productId.category,
        productInStock: order.product.productId.inStock,
       
        quantity: order.product.quantity, 
        orderedProductPrice: order.product.price, 
        orderedProductImage: order.product.image 
      } : {};


      const addressDetails = order.addressId ? {
        addressFullName: order.addressId.fullName,
        addressStreet: order.addressId.street,
        addressCity: order.addressId.city,
        addressDistrict: order.addressId.district,
        addressThana: order.addressId.thana,
        addressLandmark: order.addressId.landmark,
        addressHouse: order.addressId.house,
        addressPhone: order.addressId.phone,
        addressCountry: order.addressId.country,
      } : {};

      const userDetails = order.userId ? {
        userName: order.userId.name,
        userEmail: order.userId.email,
        userImgUrl: order.userId.imgUrl,
      } : {};

      return {
        _id: order._id, // Order ID
        orderStatus: order.status,
        orderTotalAmount: order.totalAmount,
        orderCreatedAt: order.createdAt,
        // ... অন্যান্য অর্ডার ফিল্ড ...

        ...userDetails,  
        ...productDetails, 
        ...addressDetails,
      };
    });

    res.status(200).json({
      error: false,
      message: 'Orders fetched successfully.',
      data: formattedOrders,
      totalPages: totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error while fetching orders.'
    });
  }
};
// ...existing code...



// Controller function to fetch a user's profile including orders, address, and product details
exports.fetchUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('get userid', userId);

    const user = await User.findById(userId)
      .select('name email imgUrl role createdAt updatedAt');

    const userOrders = await Order.find({ userId })
      .select('status totalAmount product createdAt updatedAt')
      .populate('product.productId', 'name price images');

    const userAddress = await Address.findOne({ userId })
      .select('fullName street city district thana landmark house phone country createdAt updatedAt');

    const userReviews = await Review.find({ userId })
      .select('productId rating review likes createdAt updatedAt');

    res.status(200).json({
      success: true,
      message: 'User profile fetched successfully.',
      data: {
        user: user || null,
        address: userAddress || null,
        orders: userOrders || [],
        reviews: userReviews || []
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching the user profile.',
      error: error.message
    });
  }
};



// Update for admin

exports.UpdateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    // Auto-calculate discount if price or oldPrice is updated
    if (updateData.price !== undefined || updateData.oldPrice !== undefined) {
      const existingProduct = await Product.findById(productId);
      if (existingProduct) {
        const price = updateData.price !== undefined ? Number(updateData.price) : existingProduct.price;
        const oldPrice = updateData.oldPrice !== undefined ? Number(updateData.oldPrice) : (existingProduct.oldPrice || 0);
        if (oldPrice && oldPrice > price) {
          updateData.discount = Math.round(((oldPrice - price) / oldPrice) * 100);
        } else {
          updateData.discount = 0;
        }
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({
        error: true,
        message: 'Product not found.'
      });
    }

    res.status(200).json({
      error: false,
      message: 'Product updated successfully.',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error while updating product.'
    });
  }
};



// Delete for admin

exports.DeleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log('Deleting product with ID:', productId);

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({
        error: true,
        message: 'Product not found.',
        console: 'Product deletion failed. No product found with the provided ID.'
      });
    }
    console.log('Product deleted successfully:', deletedProduct);

    res.status(200).json({
      error: false,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error while deleting product.'
    });
  }
};