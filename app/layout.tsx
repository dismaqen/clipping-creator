import "./globals.css";
import Link from "next/link";
import { getSupabaseServer } from "../lib/supabase-server";
import LogoutButton from "./components/LogoutButton";
export default async function Layout({children}:{children:React.ReactNode}){
 const s=await getSupabaseServer(); const {data:{user}}=await s.auth.getUser(); let role="";
 if(user){const {data:p}=await s.from("profiles").select("role").eq("id",user.id).maybeSingle(); role=p?.role||""}
 const home=role==="admin"?"/admin":role==="campaign_owner"?"/owner":"/dashboard"; const brand=role==="campaign_owner";
 return <><nav className={`nav ${brand?"nav-brand":""}`}><Link className="brand" href="/">CLIPPING <span>CREATOR</span></Link><div className="links">{user&&<span className="role-badge">{brand?"BRAND":"CREATOR"}</span>}<Link href="/campaigns">Campaigns</Link>{user&&<Link href={home}>{brand?"Brand Dashboard":"Dashboard"}</Link>}{user&&brand&&<Link className="nav-create" href="/owner#new-campaign">+ Campaign</Link>}{user&&role==="creator"&&<Link href="/wallet">Wallet</Link>}{user&&role==="admin"&&<Link href="/admin">Admin</Link>}{!user&&<Link href="/login">Login</Link>}{!user&&<Link className="btn nav-cta" href="/register">Daftar</Link>}{user&&<LogoutButton/>}</div></nav>{children}</>
}