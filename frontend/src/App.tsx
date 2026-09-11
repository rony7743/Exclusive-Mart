// App.tsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './Components/auth/AuthContext.tsx';
import Navbar from './Components/Main/Navbar.tsx';
import Footer from './Components/Main/Footer.tsx';
import ScrollToTop from './Components/ui/ScrollToTop.tsx';
import Main from './Components/Main/Main.tsx';
import About from './Components/About/About.tsx';
import Contact from './Components/contuct/Contact.tsx';
import Login from './Components/auth/Login.tsx';
import Step1 from './Components/auth/Step1.tsx';
import Step2 from './Components/auth/Step2.tsx';
import Step3 from './Components/auth/Step3.tsx';
import ForgotPassword from './Components/auth/ForgotPassword.tsx';
import NotFound from './Components/error/NotFound.tsx';
import ManageAccount from './Components/AccountDropdown/ManageAccount.tsx';
import MyOrders from './Components/AccountDropdown/MyOrders.tsx';
import MyReviews from './Components/AccountDropdown/MyReviws.tsx';
import OrderReturn from './Components/AccountDropdown/OrderReturn.tsx';
//import Payment from '../../backup-code/Pyment.tsx';
import Refer from './Components/AccountDropdown/Refer.tsx';
import WishList from './Components/AccountDropdown/WishList.tsx';
import HelpCenter from './Components/AccountDropdown/HelpCenter.tsx';
import CardPayment from './Components/AccountDropdown/PaymentMethod.tsx';
import AddressForm from './Components/AccountDropdown/AddressForm.tsx';
import ProductDetails from './Components/product/ProductDetails.tsx';
import ReviewComponent from './Components/product/ReviewComponent.tsx';
//import Messages from './Components/Main/Message.tsx';
//import UnreadMessageNotification from './Components/ui/MessageNotification.tsx';
import ViewAddress from './Components/AccountDropdown/ViewAddress.tsx';
import Message from './Components/message/Message.tsx';
import SearchResultPage from './Components/Main/SearchResultPage.tsx';

import Admin from './Components/Admin/Admin.tsx'; 
import RequestAdmin from './Components/Admin/RequestAdmin.tsx'; 
//import InsertOne from './Components/Admin/InsertOne.tsx';
import AdminOnlyRoute from './Components/PrivateRoute/AdminOnlyRoute.tsx';
import ViewProfile from './Components/message/ViewProfile.tsx';

// setting somthing
import ChangePass from './Components/ui/ChangePass.tsx';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



import { Toaster } from 'sonner';

function AppWrapper() {
  const location = useLocation();

  const shouldHideFooter =
    location.pathname.startsWith('/admin') ||
    location.pathname === '/message' ||
    location.pathname.startsWith('/messages/') ||
    location.pathname.startsWith('/details/payment');

  const shouldHideNavbar = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <Toaster />
      {!shouldHideNavbar && <Navbar />}
      {/* <UnreadMessageNotification /> */}
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Step1 />} />
        <Route path="/step2" element={<Step2 />} />
        <Route path="/step3" element={<Step3 />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/account" element={<ManageAccount />} />
        <Route path="/account/change-password" element={<ChangePass />}/>
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/wishlist" element={<WishList />} />
        
        <Route path="/returns" element={<OrderReturn />} />
        <Route path="/refer" element={<Refer />} />
        <Route path="/support" element={<HelpCenter />} />
        <Route path="/addresses" element={<ViewAddress />} />
        <Route path="/search" element={<SearchResultPage />} />
        
        {/* Message Routes */}


        <Route path="/messages/:chatId" element={<Message />} />
        <Route path="/messages/viewprofile/:userId" element={<ViewProfile />}/>

        <Route path="/reviews" element={<MyReviews />} />
        <Route path="/details/:id" element={<ProductDetails />} />
        <Route path="/details/payment/:id" element={<CardPayment />} />
        <Route path="/details/payment/address" element={<AddressForm />} />
        <Route path="/review" element={<ReviewComponent />} />
        {/* <Route path="/message" element={<Messages />} /> */}

        {/* Admin Routes */}
        <Route path="/admin/request" element={<RequestAdmin />} />
        <Route
          path="/admin"
          element={
            <AdminOnlyRoute>
              <Admin />
            </AdminOnlyRoute>
          }
        />


      </Routes>
      {!shouldHideFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;