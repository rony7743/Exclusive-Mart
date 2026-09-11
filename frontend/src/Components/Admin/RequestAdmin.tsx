import React, { useState } from 'react';
import { type FormEvent } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import NotLogin from '../ui/NotLogin';

const RequestAdmin: React.FC = () => {
  const [code, setCode] = useState<string[]>(Array(16).fill(''));
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const token = localStorage.getItem('token');

  if(!token) {
    return <NotLogin title="please Login to Admin Verification" subject="Admin Verification" />;
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1 || !/^[0-9a-zA-Z]?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 15) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      prevInput?.focus();
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9a-zA-Z]/g, '');
    
    if (pastedData.length > 0) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length && index + i < 16; i++) {
        newCode[index + i] = pastedData[i];
      }
      setCode(newCode);

      const lastFilledIndex = Math.min(index + pastedData.length, 15);
      const nextInput = document.getElementById(`code-input-${lastFilledIndex}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const verificationCode = code.join('');
    if (verificationCode.length !== 16) {
      setError('Please enter a complete 16-character code');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token'); // Retrieve token from localStorage

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/reqmakeadmin`,
        { code: verificationCode },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      if (response.status === 200) {
        setSuccess(response.data.message || 'Admin request successful! You are now an admin.');
        setCode(Array(16).fill(''));
      } else {
        setError(response.data.message || 'Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        p: { xs: 2, sm: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: 800,
          width: '100%',
          bgcolor: 'white',
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
          Admin Verification
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Enter your 16-character verification code
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: 'center',
              mb: 3,
            }}
          >
            {code.map((digit, index) => (
              <TextField
                key={index}
                id={`code-input-${index}`}
                type="text"
                inputProps={{ maxLength: 1 }}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={(e) => handlePaste(e, index)}
                variant="outlined"
                sx={{
                  width: { xs: 40, sm: 48 },
                  '& .MuiInputBase-input': {
                    textAlign: 'center',
                    fontSize: '1.1rem',
                    p: 1,
                  },
                }}
              />
            ))}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
            sx={{
              py: 1.5,
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' },
              position: 'relative',
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                Processing...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default RequestAdmin;