"use client";
import {useEffect,useState} from "react";
import {getSupabase} from "../../lib/supabase";

const money=(n:number)=>"Rp"+Number(n||0).toLocaleString("id-ID");
export default function Owner(){
 const [user,setUser]=useState<any>(null),[rows,setRows]=useState<any[]>([]),[topups,setTopups]=useState<any[]>([]),[balance,setBalance]=useState(0),[msg,setMsg]=useState("");
 const [title,setTitle]=useState(""),[platform,setPlatform]=useState("TikTok"),[rate,setRate]=useState(""),[budget,setBudget]=useState(""),[rules,setRules]=useState(""),[description,setDescription]=useState(""),[topup,setTopup]=useState(""),[method,setMethod]=useState("ShopeePay");
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
 async function save(e:React.FormEvent){e.preventDefault();setMsg("");if(!user)return;
  const amount=Number(budget); const {error}=await getSupabase().from("campaigns").insert({owner_id:user.id,title,description,platform,reward_per_1k:Number(rate),budget:amount,rules,active:false});
  if(error)setMsg(error.message);else{setMsg("Campaign diajukan. Pastikan saldo campaign mencukupi sebelum admin mengaktifkannya.");setTitle("");setDescription("");setRate("");setBudget("");setRules("");load()}
 }
 async function addTopup(e:React.FormEvent){e.preventDefault();setMsg("");const amount=Number(topup);if(amount<=0)return setMsg("Nominal top up tidak valid.");
  const {data,error}=await getSupabase().rpc("create_campaign_topup",{p_amount:amount,p_method:method});
  if(error)setMsg(error.message);else{setMsg("Permintaan top up dibuat. Pembayaran akan diproses melalui "+method+".");setTopup("");load()}
 }
 return <main className="wrap" style={{maxWidth:1080}}>
  <div className="section-head" style={{marginTop:35}}><div><div className="eyebrow">BRAND / CAMPAIGN OWNER</div><h1>Campaign Center</h1><p className="muted">Kelola campaign, budget, dan saldo reward dari satu tempat.</p></div></div>
  <div className="grid">
   <div className="card"><span className="muted">Saldo Campaign</span><div className="big">{money(balance)}</div><p className="muted">Dana yang tersedia untuk reward creator.</p></div>
   <div className="card"><span className="muted">Campaign</span><div className="big">{rows.length}</div><p className="muted">Campaign yang dibuat brand.</p></div>
  </div>
  <div className="grid" style={{alignItems:"start"}}>
   <div className="card"><h2>Isi Saldo Campaign</h2><p className="muted">Dana masuk ke wallet campaign dan digunakan untuk membayar reward creator.</p><form onSubmit={addTopup}><label>Nominal</label><input required type="number" min="10000" value={topup} onChange={e=>setTopup(e.target.value)} placeholder="Contoh 1000000"/><label>Metode pembayaran</label><select value={method} onChange={e=>setMethod(e.target.value)}><option>ShopeePay</option><option>QRIS</option><option>Bank Transfer</option></select><button className="btn">Lanjutkan Pembayaran</button></form></div>
   <div className="card"><h2>Buat Campaign</h2><form onSubmit={save}><label>Nama campaign</label><input required value={title} onChange={e=>setTitle(e.target.value)}/><label>Brief</label><textarea value={description} onChange={e=>setDescription(e.target.value)}/><label>Platform</label><select value={platform} onChange={e=>setPlatform(e.target.value)}><option>TikTok</option><option>Instagram Reels</option><option>YouTube Shorts</option><option>Semua</option></select><label>Reward per 1.000 views (Rp)</label><input required type="number" min="0" value={rate} onChange={e=>setRate(e.target.value)}/><label>Total budget (Rp)</label><input required type="number" min="0" value={budget} onChange={e=>setBudget(e.target.value)}/><label>Rules</label><textarea value={rules} onChange={e=>setRules(e.target.value)}/><button className="btn">Ajukan Campaign</button></form></div>
  </div>
  {msg&&<p className="notice">{msg}</p>}
  <div className="card"><h2>Riwayat Top Up</h2>{topups.length?topups.map(t=><div key={t.id} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #25252f"}}><span>{money(t.amount)} · {t.method}</span><span className="pill">{t.status}</span></div>):<p className="muted">Belum ada top up.</p>}</div>
  <div className="card"><h2>Campaign Saya</h2>{rows.length?rows.map(r=><div key={r.id} style={{padding:"14px 0",borderBottom:"1px solid #25252f"}}><b>{r.title}</b><div className="muted">{r.platform} · {money(r.reward_per_1k)}/1k · Budget {money(r.budget)} · {r.active?"Tayang":"Menunggu review"}</div></div>):<p className="muted">Belum ada campaign.</p>}</div>
 </main>
}