'use client'
import { useAuthManager, useAuthUser } from '@jerry/managers/auth/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogOut } from 'lucide-react';
import { useCallback } from 'react';
import { redirect } from 'next/navigation';

export function UserMenu() {

  const authManager = useAuthManager()
  const user = useAuthUser()

  const onLogOut = useCallback(() => {
    void authManager.logOut()
    redirect('/auth')
  }, [authManager])

  if (!user) {
    return null
  }

  const nameParts = user.name?.split(/\s+/, 3) ?? [user.email]
  const initials = nameParts.map((p) => p[0].toUpperCase()).join('') 

  return (
  <DropdownMenu modal={false}>
    <DropdownMenuTrigger asChild>
      <Avatar style={{cursor: 'pointer'}}>
        <AvatarImage src={user.avatar} width={40} height={40} />
        <AvatarFallback color='currentcolor'>{initials}</AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent>
        <DropdownMenuLabel>Logged in as: {user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogOut}>
          <LogOut />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenu>
  )
}