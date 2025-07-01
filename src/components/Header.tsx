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
    <div className="dashboard-links flex justify-center gap-4 items-center py-4">
      <Link href="/dashboard" className="text-orange-700 hover:text-orange-900 font-medium">
        👩‍🍳 Dashboard
      </Link>
      <Link href="/ordini" className="text-orange-700 hover:text-orange-900 font-medium">
        📥 Ordini
      </Link>
      <Link href="/calendario" className="text-blue-700 hover:text-blue-900 font-medium">
        📅 Calendario
      </Link>
      <Link href="/vetrina" className="text-pink-700 hover:text-pink-900 font-medium">
        🛒 Vetrina
      </Link>
      <button
        onClick={handleLogout}
        className="text-gray-600 hover:text-red-600 font-medium"
      >
        🔓 Logout
      </button>
    </div>
  );

}
