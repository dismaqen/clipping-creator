"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useParams} from "next/navigation";
import {getSupabase} from "../../../../lib/supabase";
const money=(n:number)=>"Rp"+Number(n||0).toLocaleString("id-ID");
export default function OwnerCampaignDetail(){
 const p=useParams(); const id=String(p.id);
 const[c,setC]=useState<any>(null),[stats,setStats]=useState<any>({}),[subs,setSubs]=useState<any[]>([]);
 useEffect(()=>{(async()=>{const s=getSupabase();const q=await s.from("campaigns").select("*").eq("id",id).single();setC(q.data);const st=await s.rpc("get_owner_campaign_stats",{p_campaign_id:id});setStats(st.data?.[0]||{});const ss=await s.from("submissions").select("id,post_url,platform,status,approved_views,reward_amount,created_at,creator_id").eq("campaign_id",id).order("created_at",{ascending:false});setSubs(ss.data||[])})()},[id]);
 if(!c)return <main className="wrap"><div className="card">Loading...</div></main>;
 return <main className="wrap"><Link href="/owner/campaigns" className="muted">← Campaigns</Link><div className="section-head"><div><div className="eyebrow">CAMPAIGN</div><h1>{c.title}</h1><p className="muted">{c.platform} · {c.status||"draft"}</p></div></div><div className="grid"><div className="card"><span className="muted">Views</span><div className="big">{Number(stats.total_views||0).toLocaleString("id-ID")}</div></div><div className="card"><span className="muted">Submissions</span><div className="big">{stats.total_submissions||0}</div></div><div className="card"><span className="muted">Creators</span><div className="big">{stats.creators||0}</div></div><div className="card"><span className="muted">Reward</span><div className="big">{money(stats.total_rewards)}</div></div></div><section className="card"><h2>Submission</h2>{subs.length?subs.map(s=><div className="history-row" key={s.id}><span><b>{s.platform}</b><small>{s.post_url}</small></span><span className="pill">{s.status} · {Number(s.approved_views||0).toLocaleString("id-ID")} views</span></div>):<p className="muted">Belum ada submission.</p>}</section></main>;
}