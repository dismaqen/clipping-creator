"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

export default function Login(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const router=useRouter();
  async function go(e:React.FormEvent){
    e.preventDefault(); setBusy(true);
    try {
      const {error}=await getSupabase().auth.signInWithPassword({email,password});
      if(error) alert(error.message); else router.push("/dashboard");
    } catch(error){ alert(error instanceof Error?error.message:"Gagal login."); }
    finally{setBusy(false);}
  }
  return <main className="wrap" style={{maxWidth:520}}>
    <div className="card">
      <h1>Login Creator</h1>
      <p className="muted">Masuk ke dashboard Clipping Creator.</p>
      <form onSubmit={go}>
        <label>Email</label><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <label>Password</label><input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn" disabled={busy}>{busy?"Memproses...":"Login"}</button>
      </form>
      <p className="muted">Belum punya akun? <Link href="/register">Daftar creator</Link></p>
    </div>
  </main>
}