import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useIdleTimer from './hooks/useIdleTimer';
import { useAuth } from './contexts/AuthContext';

const IdleHandler = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLocked, setIsLocked] = useState(false);

  useIdleTimer(process.env.REACT_APP_IdleTime, () => {
    setIsLocked(true);
    navigate('/login', { state: {logout:true }}); // Navigate to login page after logout
  });

  useEffect( () => {
    if (isLocked) {
      logout(); // clear everything from localstorage
    }
  }, [isLocked]);

  return children;
};

export default IdleHandler;
