import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@clerk/nextjs';

const useProtectedRoute = () => {
  const { isLoaded, userId } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);
};

export default useProtectedRoute;
