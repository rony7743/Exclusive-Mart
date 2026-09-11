const express = require('express');
require('dotenv').config();
const connectDB = require('./dbConfig');

const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http');

const productRouter = require('./routers/productRouters');
//const cartRouter = require('./routers/cartRouter');
const reviewRouter = require('./routers/reviewRouter');
const imgRouter = require('./routers/imgRouter');
const authRouter = require('./routers/authRouter');
const addressRoutes = require('./routers/addressRoutes');
const OrderRouter = require('./routers/orderRouter');
const wishlistRouter = require('./routers/wishListRouter');
const adminRouter = require('./routers/adminRouter'); 

const messageSocket = require('./sockets/Messages');

const app = express();
const server = http.createServer(app); // ✅ ঠিক জায়গায় একবার createServer
const io = socketIo(server, {
  cors: {
    origin: "*", // প্রয়োজনে origin ঠিক করো
    methods: ["GET", "POST"]
  }
});

//messageSocket(io); // Socket setup
messageSocket(io); // Socket setup

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api', productRouter);
app.use('/api', imgRouter);
// app.use('/api', userRouter);
//app.use('/api', cartRouter);
app.use('/api', reviewRouter);
app.use('/api', authRouter);
app.use('/api', addressRoutes);
app.use('/api', OrderRouter);
app.use('/api', wishlistRouter);
app.use('/api', adminRouter); 


// Test Route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start Server
const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected');
    server.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
