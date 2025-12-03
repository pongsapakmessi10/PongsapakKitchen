"use client";

import { AlertProvider } from "../components/AlertProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AlertProvider>{children}</AlertProvider>;
}
