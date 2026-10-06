"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

export default function Register(){
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [name,setName]=useState("");
  const [busy,setBusy]=useState(false); const router=useRouter();
  async function go(e:React.FormEvent){
    e.preventDefault(); setBusy(true);
    try {
      const s=getSupabase();
      const {data,error}=await s.auth.signUp({email,password,options:{data:{display_name:name}}});
      if(error) alert(error.message);
      else if(data.session) router.push("/dashboard");
      else alert("Akun dibuat. Jika konfirmasi email aktif, cek email lu lalu login.");
    } catch(error){ alert(error instanceof Error?error.message:"Gagal daftar."); }
    finally{setBusy(false);}
  }
  return <main className="wrap" style={{maxWidth:520}}>
    <div className="card">
      <h1>Daftar Creator</h1><p className="muted">Buat akun untuk ikut campaign dan kirim clip.</p>
      <form onSubmit={go}>
        <label>Nama</label><input required value={name} onChange={e=>setName(e.target.value)} />
        <label>Email</label><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <label>Password</label><input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn" disabled={busy}>{busy?"Membuat akun...":"Daftar"}</button>
      </form>
      <p className="muted">Sudah punya akun? <Link href="/login">Login</Link></p>
    </div>
  </main>
}