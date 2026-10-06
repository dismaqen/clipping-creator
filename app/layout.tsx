import "./globals.css";
import Link from "next/link";
import { getSupabaseServer } from "../lib/supabase-server";
export default async function Layout({children}:{children:React.ReactNode}){
 const s=await getSupabaseServer(); const {data:{user}}=await s.auth.getUser(); let role="";
 if(user){const {data:p}=await s.from("profiles").select("role").eq("id",user.id).maybeSingle(); role=p?.role||""}
 return <><nav className="nav"><Link className="brand" href="/">CLIPPING <span>CREATOR</span></Link><div className="links"><Link href="/campaigns">Campaigns</Link>{user&&<Link href="/dashboard">Dashboard</Link>}{user&&role==="campaign_owner"&&<Link href="/owner">Buat Campaign</Link>}{user&&<Link href="/wallet">Wallet</Link>}{user&&role==="admin"&&<Link href="/admin">Admin</Link>}{!user&&<Link href="/login">Login</Link>}</div></nav>{children}</>}