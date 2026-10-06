"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabase";

type Campaign={id:string;title:string;platform:string;reward_per_1k:number;budget:number;rules:string|null};
export default function Campaigns(){
  const [rows,setRows]=useState<Campaign[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  useEffect(()=>{(async()=>{const {data,error}=await getSupabase().from("campaigns").select("id,title,platform,reward_per_1k,budget,rules").eq("active",true).order("created_at",{ascending:false});if(error)setError(error.message);else setRows(data||[]);setLoading(false);})();},[]);
  return <main className="wrap"><h1>Campaign Aktif</h1>{loading?<div className="card">Loading...</div>:error?<div className="notice">{error}</div>:rows.length===0?<div className="card"><p className="muted">Belum ada campaign aktif.</p></div>:<div className="grid">{rows.map(c=><div className="card" key={c.id}><span className="tag">{c.platform}</span><h2>{c.title}</h2><p><b>Rp{Number(c.reward_per_1k).toLocaleString("id-ID")}</b> / 1.000 views</p><p className="muted">Budget Rp{Number(c.budget).toLocaleString("id-ID")}</p><p className="muted">{c.rules||"Tidak ada aturan tambahan."}</p><Link className="btn" href={"/submit?campaign="+c.id}>Ambil & Submit</Link></div>)}</div>}</main>
}