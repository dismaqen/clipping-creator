import "./globals.css";
import Link from "next/link";
import { getSupabaseServer } from "../lib/supabase-server";

export default async function Layout({children}:{children:React.ReactNode}){
  const supabase=await getSupabaseServer();
  const {data:{user}}=await supabase.auth.getUser();
  let isAdmin=false;
  if(user){
    const {data:profile}=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle();
    isAdmin=profile?.role==="admin";
  }
  return <><nav className="nav"><Link className="brand" href="/">CLIPPING <span>CREATOR</span></Link><div className="links"><Link href="/campaigns">Campaigns</Link><Link href="/dashboard">Dashboard</Link><Link href="/wallet">Wallet</Link>{isAdmin&&<Link href="/admin">Admin</Link>}{!user&&<Link href="/login">Login</Link>}</div></nav>{children}</>
}