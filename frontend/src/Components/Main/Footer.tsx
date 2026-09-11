import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black mt-20 text-white px-6 md:px-16 py-10">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Exclusive */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Exclusive</h2>
          <p className="mb-3">Subscribe</p>
          <p className="mb-4 text-sm">Get 10% off your first order</p>
          <div className="flex border rounded-md overflow-hidden">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-3 py-2 text-black flex-1 outline-none"
            />
            <button className="bg-white text-black px-4">➤</button>
          </div>
        </div>

        {/* Support */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Support</h2>
          <p className="text-sm">111 Bijoy sarani, Dhaka,<br />DH 1515, Bangladesh.</p>
          <p className="text-sm mt-2">exclusive@gmail.com</p>
          <p className="text-sm mt-1">+88015-88888-9999</p>
        </div>

        {/* Account */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Account</h2>
          <ul className="space-y-2 text-sm">
            <li>My Account</li>
            <li>Login / Register</li>
            <li>Cart</li>
            <li>Wishlist</li>
            <li>Shop</li>
          </ul>
        </div>

        {/* Quick Link */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Quick Link</h2>
          <ul className="space-y-2 text-sm">
            <li>Privacy Policy</li>
            <li>Terms Of Use</li>
            <li>FAQ</li>
            <li>Contact</li>
          </ul>
        </div>

        {/* Download App */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Download App</h2>
          <p className="text-sm mb-3">Save $3 with App New User Only</p>
          <div className="flex gap-2 mb-3">
            <img src="/figma/qr.png" alt="qr" className="w-20 h-20" />
            <div className="flex flex-col justify-between">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="w-24" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="w-24" />
            </div>
          </div>
          <div className="flex gap-4 text-lg mt-4">
            <FaFacebookF />
            <FaTwitter />
            <FaInstagram />
            <FaLinkedinIn />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-10 pt-5 text-center text-sm text-gray-400">
        © Copyright Rimel 2022. All rights reserved
      </div>
    </footer>
  );
};

export default Footer;
