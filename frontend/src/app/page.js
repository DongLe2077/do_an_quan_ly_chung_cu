'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

export default function HomePage() {
  const router = useRouter();
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, []);

  return null;
}
