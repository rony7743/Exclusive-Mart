import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '../ui/LoadingSpinner';
import axios from 'axios';

interface AdminOnlyRouteProps {
  children: ReactNode;
}

const AdminOnlyRoute: React.FC<AdminOnlyRouteProps> = ({ children }) => {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setAllowed(false);
          return;
        }

        await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/roleckk`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAllowed(true);
      } catch (err) {
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) return <LoadingSpinner message="Checking admin privileges..." className='flex justify-center items-center min-h-screen' />;
  if (!allowed) return <Navigate to="/admin/request" />;

  return <>{children}</>;
};

export default AdminOnlyRoute;