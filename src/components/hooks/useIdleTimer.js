import { useEffect, useState } from 'react';

const useIdleTimer = (timeout, onIdle) => {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timer;

    const handleActivity = () => {
      clearTimeout(timer);
      setIsIdle(false);
      timer = setTimeout(() => {
        setIsIdle(true);
        if (onIdle) onIdle();
      }, timeout);
    };

    handleActivity();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [timeout, onIdle]);

  return isIdle;
};

export default useIdleTimer;
