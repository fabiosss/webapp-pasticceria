// components/Header.tsx
'use client';

import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-links">
      <Link href="/vetrina">📦 Vetrina</Link>
      <Link href="/calendario">📅 Calendario</Link>
      <button onClick={handleLogout}>🔓 Logout</button>
    </div>
  );
}
