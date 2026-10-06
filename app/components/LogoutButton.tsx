"use client";

import { useRouter } from "next/navigation";
import { getSupabase } from "../lib/supabase";

export default function LogoutButton(){
  const router=useRouter();
  async function logout(){
    await getSupabase().auth.signOut();
    router.push("/");
    router.refresh();
  }
  return <button className="nav-logout" onClick={logout}>Keluar</button>;
}
