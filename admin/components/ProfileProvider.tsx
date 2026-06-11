'use client';

import { createContext, useContext } from 'react';
import type { AdminProfile } from '@/lib/auth';

const ProfileContext = createContext<AdminProfile | null>(null);

export function ProfileProvider({
  profile,
  children
}: {
  profile: AdminProfile;
  children: React.ReactNode;
}) {
  return (
    <ProfileContext.Provider value={profile}>{children}</ProfileContext.Provider>
  );
}

export function useProfile(): AdminProfile {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
