"use client";

import { UserLevelsProvider } from "@/lib/UserLevelsContext";

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
