'use client'

import { CreateResourceModal } from '@jerry/components/resource-modal';
import { useAuthUser } from '@jerry/managers/auth/react';

export default function Home() {

  const user = useAuthUser()

  return (
    <>
    <h1>Welcome to Jerry</h1>
     {user?.isAdmin && <CreateResourceModal />}
    </>
  );
}
