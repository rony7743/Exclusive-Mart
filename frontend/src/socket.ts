import { io } from 'socket.io-client';

const socket = io(`${import.meta.env.VITE_APP_API_URL}`, {
  autoConnect: false,
  auth: {
    token: null,
  },
});

export const syncSocketAuthToken = (token: string | null) => {
  socket.auth = { token };

  if (!token) {
    if (socket.connected) {
      socket.disconnect();
    }
    return;
  }

  if (socket.connected) {
    socket.disconnect();
  }

  socket.connect();
};

export default socket;
