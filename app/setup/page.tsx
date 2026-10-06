"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {getSupabase} from "../../lib/supabase";
export default function Setup(){const [msg,setMsg]=useState("");const router=useRouter();async function makeAdmin(){setMsg("");const s=getSupabase();const {data:{user}}=await s.auth.getUser();if(!user){router.push("/login");return;}const {data,error}=await s.rpc("bootstrap_first_admin");if(error)setMsg(error.message);else if(data){setMsg("Admin berhasil dibuat. Buka Admin Panel.");setTimeout(()=>router.push("/admin"),500);}else setMsg("Admin sudah pernah dibuat. Akun ini bukan admin.");}return <main className="wrap" style={{maxWidth:600}}><div className="card"><h1>Setup Clipping Creator</h1><p className="muted">Gunakan sekali untuk menjadikan akun pertama sebagai admin.</p><button className="btn" onClick={makeAdmin}>Jadikan akun ini Admin</button>{msg&&<p className="notice">{msg}</p>}</div></main>}
