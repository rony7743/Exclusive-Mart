import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import LoginIcon from '@mui/icons-material/Login'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

interface NotLoginProps {
    title?: string;
    subject?: string;
}

const NotLogin: React.FC<NotLoginProps> = (props) => {
    const navigate = useNavigate();


        return (
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="text-center py-16 sm:py-24">
              <div className="mx-auto flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-blue-50">
                <LoginIcon className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500" />
              </div>
              <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-800">
                {props.title ? props.title : "Please Login to View Your"}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                You need to be logged in to access your {props.subject || 'Wishlist'}. Login to see all your saved items.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/login')}
                  className="text-sm sm:text-base px-6 py-2"
                >
                  Login Now
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PersonAddIcon />}
                  onClick={() => navigate('/signup')}
                  className="text-sm sm:text-base px-6 py-2"
                >
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        );
}

export default NotLogin
