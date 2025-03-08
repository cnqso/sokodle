"use client";

import { UserLevelsProvider } from "@/app/userlevels/UserLevelsContext";

export default function UserLevelsPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserLevelsProvider>
      {children}
    </UserLevelsProvider>
  )

}
