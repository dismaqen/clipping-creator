"use client";
import { useState,useEffect } from "react";
import Link from "next/link";
import { useRouter,useSearchParams } from "next/navigation";
import { getSupabase } from "../../lib/supabase";
export default function Login(){
 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false); const router=useRouter(); const search=useSearchParams();
 useEffect(()=>{getSupabase().auth.getSession().then(({data})=>{if(data.session) router.replace(search.get("next")||"/dashboard")})},[router,search]);
 async function go(e:React.FormEvent){e.preventDefault();setBusy(true);try{const {data,error}=await getSupabase().auth.signInWithPassword({email,password});if(error)alert(error.message);else router.replace(search.get("next")||"/dashboard")}catch(error){alert(error instanceof Error?error.message:"Gagal login.")}finally{setBusy(false)}}
 return <main className="wrap" style={{maxWidth:520}}><div className="card"><h1>Login</h1><p className="muted">Masuk ke akun Clipping Creator.</p><form onSubmit={go}><label>Email</label><input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/><label>Password</label><input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)}/><button className="btn" disabled={busy}>{busy?"Memproses...":"Login"}</button></form><p className="muted">Belum punya akun? <Link href="/register">Daftar</Link></p></div></main>
}