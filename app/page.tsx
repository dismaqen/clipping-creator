import Link from "next/link";
import { getSupabaseServer } from "../lib/supabase-server";

export default async function Home(){
 const s=await getSupabaseServer(); const {data:{user}}=await s.auth.getUser();
 let role=""; if(user){const {data:p}=await s.from("profiles").select("role").eq("id",user.id).maybeSingle(); role=p?.role||""}
 const dashboard=role==="admin"?"/admin":role==="campaign_owner"?"/owner":"/dashboard";
 return <main>
  <section className="wrap hero">
   <div className="eyebrow">CREATOR × BRAND MARKETPLACE</div>
   <h1>Ubah konten pendek jadi penghasilan.</h1>
   <p className="hero-copy">Clipping Creator mempertemukan creator dengan campaign dari brand. Pilih campaign, buat clip, submit link, dan dapatkan reward berdasarkan performa yang disetujui.</p>
   <div className="hero-actions"><Link className="btn" href="/campaigns">Jelajahi Campaign →</Link>{user?<Link className="btn secondary" href={dashboard}>Buka Dashboard</Link>:<Link className="btn secondary" href="/register">Daftar sebagai Creator</Link>}</div>
   <div className="stat-row"><div className="stat"><strong>01</strong><span>Pilih campaign</span></div><div className="stat"><strong>02</strong><span>Upload & submit clip</span></div><div className="stat"><strong>03</strong><span>Earn dari views</span></div></div>
  </section>
  <section className="wrap section"><div className="section-head"><div><div className="eyebrow">SATU PLATFORM</div><h2>Semua yang creator butuhkan.</h2></div><Link className="btn ghost" href="/campaigns">Lihat campaign</Link></div><div className="grid">{[["🎬","Campaign Marketplace","Temukan campaign aktif, baca brief, cek rate, lalu pilih campaign yang paling cocok."],["📈","Track Performance","Pantau submission, approved views, status review, dan penghasilan dari satu dashboard."],["💸","Wallet & Payout","Reward yang disetujui masuk ke saldo dan bisa diajukan untuk payout."],["🏢","Untuk Brand","Buat campaign, tentukan brief dan reward, lalu kelola submission creator setelah direview admin."]].map(([icon,title,desc])=><div className="card feature" key={title}><div className="feature-icon">{icon}</div><h3>{title}</h3><p className="muted">{desc}</p></div>)}</div></section>
  <section className="wrap section"><div className="card" style={{padding:"34px"}}><div className="eyebrow">CREATOR FLOW</div><h2 style={{fontSize:32,margin:"10px 0"}}>Mulai dari campaign. Selesaikan dengan payout.</h2><p className="hero-copy" style={{fontSize:15}}>Semua status campaign dan submission tersusun jelas supaya creator tahu apa yang harus dikerjakan dan kapan reward masuk.</p><div className="hero-actions">{user?<Link className="btn" href={dashboard}>Lanjut ke akun</Link>:<><Link className="btn" href="/register">Mulai sekarang</Link><Link className="btn secondary" href="/login">Sudah punya akun?</Link></>}</div></div></section>
  <footer className="wrap footer">© {new Date().getFullYear()} Clipping Creator · Creator campaign marketplace</footer>
 </main>
}