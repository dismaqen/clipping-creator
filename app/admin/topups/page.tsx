"use client";
import {useEffect,useState} from "react";
import {getSupabase} from "../../../lib/supabase";
export default function Topups(){
 const [rows,setRows]=useState<any[]>([]),[msg,setMsg]=useState("");
 async function load(){const {data}=await getSupabase().from("campaign_topups").select("*,profiles(display_name)").order("created_at",{ascending:false});setRows(data||[])}
 useEffect(()=>{load()},[]);
 async function paid(id:string){setMsg("");const {error}=await getSupabase().rpc("admin_mark_topup_paid",{p_topup_id:id});if(error)setMsg(error.message);else{setMsg("Top up ditandai paid dan saldo campaign ditambahkan.");load()}}
 return <main className="wrap" style={{maxWidth:1050}}><div className="section-head" style={{marginTop:35}}><div><div className="eyebrow">ADMIN</div><h1>Campaign Top Ups</h1><p className="muted">Kontrol dana masuk dari brand sebelum campaign dijalankan.</p></div></div>{msg&&<p className="notice">{msg}</p>}<div className="card">{rows.length?<table><thead><tr><th>Brand</th><th>Nominal</th><th>Metode</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.profiles?.display_name||r.owner_id.slice(0,8)}</td><td>Rp{Number(r.amount).toLocaleString("id-ID")}</td><td>{r.method}</td><td><span className="pill">{r.status}</span></td><td>{r.status==="pending"&&<button className="btn" onClick={()=>paid(r.id)}>Konfirmasi Paid</button>}</td></tr>)}</tbody></table>:<p className="muted">Belum ada top up.</p>}</div></main>;
}
