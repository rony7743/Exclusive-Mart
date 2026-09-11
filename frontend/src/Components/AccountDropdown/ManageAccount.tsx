import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../auth/AuthContext';
import {
  FaShoppingBag,
  FaFileAlt,
  FaLock,
  FaMapMarkerAlt,
  FaHeart,
  FaMoneyBillWave,
  FaTachometerAlt,
} from 'react-icons/fa';
import { FiArrowRight, FiSave, FiUser, FiPhone, FiMapPin, FiGlobe, FiCalendar } from 'react-icons/fi';

type ProfileForm = {
  name: string;
  phone: string;
  city: string;
  country: string;
  gender: string;
  dateOfBirth: string;
  imgUrl: string;
  email: string;
};

const menuItems = [
  { icon: FaShoppingBag, label: 'Orders', path: '/orders', tone: 'text-blue-700 bg-blue-50' },
  { icon: FaFileAlt, label: 'Quote', path: '/account/quote', tone: 'text-indigo-700 bg-indigo-50' },
 
  { icon: FaLock, label: 'Change Password', path: '/account/change-password', tone: 'text-rose-700 bg-rose-50' },
  { icon: FaMapMarkerAlt, label: 'Addresses', path: '/addresses', tone: 'text-emerald-700 bg-emerald-50' },
  { icon: FaHeart, label: 'Wish List', path: '/wishlist', tone: 'text-pink-700 bg-pink-50' },
  { icon: FaMoneyBillWave, label: 'Transactions', path: '/account/transactions', tone: 'text-amber-700 bg-amber-50' },
];

const emptyForm: ProfileForm = {
  name: '',
  phone: '',
  city: '',
  country: '',
  gender: '',
  dateOfBirth: '',
  imgUrl: '',
  email: '',
};

const ManageAccount: React.FC = () => {
  const navigate = useNavigate();
  const { authData, setAuthData } = useAuth();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const role = authData?.role || 'user';
  const userId = authData?.userId || JSON.parse(localStorage.getItem('user') || '{}')._id;
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !apiUrl) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data.user || {};
        setForm({
          name: user.name || authData?.name || '',
          phone: user.phone || '',
          city: user.city || '',
          country: user.country || '',
          gender: user.gender || '',
          dateOfBirth: user.dateOfBirth || '',
          imgUrl: user.imgUrl || authData?.imgUrl || '',
          email: user.email || authData?.email || '',
        });
      } catch (error) {
        toast.error('Failed to load account info');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [apiUrl, authData?.email, authData?.imgUrl, authData?.name]);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !apiUrl) {
      toast.error('Please login again');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        city: form.city,
        country: form.country,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        imgUrl: form.imgUrl,
      };

      const res = await axios.patch(`${apiUrl}/api/me`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = res.data.user;
      const nextToken = res.data.token || token;

      localStorage.setItem('token', nextToken);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAuthData((prev) => ({
        ...prev,
        name: updatedUser.name || prev.name,
        email: updatedUser.email || prev.email,
        userId: updatedUser._id || prev.userId,
        imgUrl: updatedUser.imgUrl || prev.imgUrl,
        role: updatedUser.role || prev.role,
        token: nextToken,
        isAuthenticated: true,
      }));

      toast.success(res.data.message || 'Profile updated');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const profileName = form.name || authData?.name || 'User';
  const profileImg = form.imgUrl || authData?.imgUrl;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e6f2ff_0%,_#f8fbff_45%,_#f4f6f8_100%)] px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
          <section className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur sm:p-5">
            <div className="rounded-xl bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800 p-4 text-white">
              <div
                className="flex cursor-pointer items-center gap-3"
                onClick={() => userId && navigate(`/messages/viewprofile/${userId}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && userId) {
                    e.preventDefault();
                    navigate(`/messages/viewprofile/${userId}`);
                  }
                }}
              >
                <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-white/30 bg-white/15">
                  {profileImg ? (
                    <img src={profileImg} alt={profileName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-semibold">
                      {profileName[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/70">Account Overview</p>
                  <h1 className="truncate text-lg font-semibold">{profileName}</h1>
                  <p className="truncate text-xs text-white/75">{form.email || authData?.email || 'No email'}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-white/15 bg-white/10 p-2.5">
                  <p className="text-white/70">Role</p>
                  <p className="mt-1 font-medium capitalize">{role}</p>
                </div>
                <div className="rounded-lg border border-white/15 bg-white/10 p-2.5">
                  <p className="text-white/70">Phone</p>
                  <p className="mt-1 truncate font-medium">{form.phone || 'Add number'}</p>
                </div>
              </div>
            </div>

            {role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="mt-4 flex w-full items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                <span className="flex items-center gap-2">
                  <FaTachometerAlt />
                  Admin Dashboard
                </span>
                <FiArrowRight />
              </button>
            )}
          </section>

          <section className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur sm:p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Workspace</p>
                <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Manage Your Account</h2>
              </div>
              <p className="text-sm text-slate-500">Edit your basic profile information</p>
            </div>

            <form onSubmit={handleSave} className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <FiUser />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Profile Details</h3>
                  <p className="text-xs text-slate-500">Update name, mobile and other details</p>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Full Name</label>
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
                      <FiUser className="text-slate-400" />
                      <input
                        className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Mobile Number</label>
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
                      <FiPhone className="text-slate-400" />
                      <input
                        className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="e.g. 01XXXXXXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">City</label>
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
                      <FiMapPin className="text-slate-400" />
                      <input
                        className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
                        value={form.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="City"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Country</label>
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
                      <FiGlobe className="text-slate-400" />
                      <input
                        className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
                        value={form.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        placeholder="Country"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Gender</label>
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                      value={form.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Date of Birth</label>
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
                      <FiCalendar className="text-slate-400" />
                      <input
                        type="date"
                        className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
                        value={form.dateOfBirth}
                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-600">Email (read-only)</label>
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 outline-none"
                      value={form.email}
                      readOnly
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving || isLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiSave />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className="group rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-4"
                  >
                    <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg text-lg ${item.tone}`}>
                      <Icon />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{item.label}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 group-hover:text-blue-600">
                      <span>Open</span>
                      <FiArrowRight className="transition group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })}

              {role !== 'admin' && (
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="group rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-4"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-lg text-amber-700">
                    <FaTachometerAlt />
                  </div>
                  <p className="text-sm font-semibold text-amber-900 leading-tight">Admin Panel</p>
                  <p className="mt-1 text-xs text-amber-700/80">Request or open admin tools</p>
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ManageAccount;
