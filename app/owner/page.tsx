"use client";

import {useEffect,useState} from "react";
import {getSupabase} from "../../lib/supabase";

const money=(n:number)=>"Rp"+Number(n||0).toLocaleString("id-ID");

export default function Owner(){
 const [user,setUser]=useState<any>(null),[rows,setRows]=useState<any[]>([]),[topups,setTopups]=useState<any[]>([]),[balance,setBalance]=useState(0),[msg,setMsg]=useState("");
 const [title,setTitle]=useState(""),[platform,setPlatform]=useState("TikTok"),[rate,setRate]=useState(""),[budget,setBudget]=useState(""),[rules,setRules]=useState(""),[description,setDescription]=useState(""),[topup,setTopup]=useState(""),[method,setMethod]=useState("SeaBank");

 async function load(){
  const s=getSupabase(); const {data:{user}}=await s.auth.getUser(); setUser(user); if(!user)return;
  const [c,w,t]=await Promise.all([
   s.from("campaigns").select("*").eq("owner_id",user.id).order("created_at",{ascending:false}),
   s.from("campaign_wallets").select("balance").eq("owner_id",user.id).maybeSingle(),
   s.from("campaign_topups").select("*").eq("owner_id",user.id).order("created_at",{ascending:false}).limit(10)
  ]);
  setRows(c.data||[]);setBalance(w.data?.balance||0);setTopups(t.data||[]);
 }
 useEffect(()=>{load()},[]);

 async function save(e:React.FormEvent){
  e.preventDefault();setMsg("");if(!user)return;
  const amount=Number(budget);
  if(!title.trim()||amount<=0||Number(rate)<0)return setMsg("Lengkapi nama campaign, reward, dan budget.");
  const {error}=await getSupabase().from("campaigns").insert({owner_id:user.id,title,description,platform,reward_per_1k:Number(rate),budget:amount,rules,active:false});
  if(error)setMsg(error.message);else{setMsg("Campaign berhasil diajukan dan menunggu review admin.");setTitle("");setDescription("");setRate("");setBudget("");setRules("");load()}
 }

 async function addTopup(e:React.FormEvent){
  e.preventDefault();setMsg("");
  const amount=Number(topup);
  if(amount<10000)return setMsg("Minimal top up Rp10.000.");
  const {error}=await getSupabase().rpc("create_campaign_topup",{p_amount:amount,p_method:method});
  if(error)setMsg(error.message);else{setMsg("Permintaan top up dibuat. Transfer sesuai instruksi pembayaran di bawah, lalu admin akan memverifikasi.");setTopup("");load()}
 }

 return <main className="wrap owner-page" style={{maxWidth:1120}}>
  <section className="hero owner-hero brand-workspace-hero" style={{paddingBottom:35}}>
   <div className="eyebrow">BRAND STUDIO · CAMPAIGN OWNER</div>
   <h1>Brand Studio</h1>
   <p className="hero-copy">Buat campaign, tentukan reward per 1.000 views, lalu isi saldo untuk membayar creator.</p>
  </section>

  <div className="grid owner-stats">
   <div className="card"><span className="muted">Saldo campaign</span><div className="big">{money(balance)}</div><p className="muted">Dana tersedia untuk reward creator.</p></div>
   <div className="card"><span className="muted">Total campaign</span><div className="big">{rows.length}</div><p className="muted">Campaign yang kamu buat.</p></div>
   <div className="card"><span className="muted">Status</span><div className="big">{rows.filter(r=>r.active).length}</div><p className="muted">Campaign yang sedang tayang.</p></div>
  </div>

  <div className="grid" style={{alignItems:"start"}}>
   <div className="card">
    <div className="eyebrow">WALLET</div><h2>Isi saldo campaign</h2>
    <p className="muted">Top up dipakai untuk membayar reward creator. Setelah transfer, admin melakukan verifikasi.</p>
    <form onSubmit={addTopup}>
     <label>Nominal top up</label><input required type="number" min="10000" value={topup} onChange={e=>setTopup(e.target.value)} placeholder="Contoh 1000000"/>
     <label>Metode pembayaran</label>
     <select value={method} onChange={e=>setMethod(e.target.value)}><option>SeaBank</option><option>QRIS</option><option>ShopeePay</option><option>Bank Transfer</option></select>
     <button className="btn">Buat Instruksi Pembayaran</button>
    </form>
    <div className="payment-box">
      <b>Transfer SeaBank</b>
      <div className="payment-account">901049421246</div>
      <div className="muted">Rekening pembayaran Clipping Creator</div>
      <div className="payment-note">Pastikan nominal transfer sesuai top up yang dibuat agar verifikasi admin lebih cepat.</div>
    </div>
   </div>

   <div className="card brand-builder-card" id="new-campaign">
    <div className="eyebrow">BRAND STUDIO · CAMPAIGN BUILDER</div><h2>Buat campaign</h2>
    <form onSubmit={save}>
     <label>Nama campaign</label><input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Contoh: Campaign Brand A"/>
     <label>Brief</label><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Jelaskan konten, angle, CTA, dan target."/>
     <label>Platform</label><select value={platform} onChange={e=>setPlatform(e.target.value)}><option>TikTok</option><option>Instagram Reels</option><option>YouTube Shorts</option><option>Semua</option></select>
     <label>Reward per 1.000 views (Rp)</label><input required type="number" min="0" value={rate} onChange={e=>setRate(e.target.value)} placeholder="Contoh 5000"/>
     <label>Total budget (Rp)</label><input required type="number" min="1" value={budget} onChange={e=>setBudget(e.target.value)} placeholder="Contoh 5000000"/>
     <label>Rules</label><textarea value={rules} onChange={e=>setRules(e.target.value)} placeholder="Aturan upload, hashtag, durasi, dan larangan."/>
     <button className="btn">Ajukan Campaign</button>
    </form>
   </div>
  </div>

  {msg&&<p className="notice">{msg}</p>}

  <section className="section">
   <div className="section-head"><div><div className="eyebrow">PAYMENT HISTORY</div><h2>Riwayat top up</h2></div></div>
   <div className="card">{topups.length?topups.map(t=><div key={t.id} className="history-row"><span><b>{money(t.amount)}</b><small>{t.method}</small></span><span className="pill">{t.status}</span></div>):<p className="muted">Belum ada top up.</p>}</div>
  </section>

  <section className="section">
   <div className="section-head"><div><div className="eyebrow">YOUR CAMPAIGNS</div><h2>Campaign saya</h2></div></div>
   <div className="card">{rows.length?rows.map(r=><div key={r.id} className="history-row"><span><b>{r.title}</b><small>{r.platform} · {money(r.reward_per_1k)}/1k · Budget {money(r.budget)}</small></span><span className="pill">{r.active?"Tayang":"Review admin"}</span></div>):<p className="muted">Belum ada campaign.</p>}</div>
  </section>
 </main>
}