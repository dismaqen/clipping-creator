"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

function SubmitForm(){
  const q=useSearchParams(); const campaignId=q.get("campaign")||"";
  const [campaign,setCampaign]=useState<any>(null); const [url,setUrl]=useState(""); const [note,setNote]=useState(""); const [platform,setPlatform]=useState("TikTok"); const [done,setDone]=useState(false); const [error,setError]=useState("");
  useEffect(()=>{if(!campaignId)return;(async()=>{const {data,error}=await getSupabase().from("campaigns").select("id,title,platform").eq("id",campaignId).single();if(error)setError(error.message);else {setCampaign(data);if(data.platform!=="Semua")setPlatform(data.platform==="Instagram Reels"?"Instagram":data.platform.replace("YouTube Shorts","YouTube"));}})()},[campaignId]);
  async function submit(e:React.FormEvent){e.preventDefault();setError("");const supabase=getSupabase();const {data:{user}}=await supabase.auth.getUser();if(!user){setError("Login dulu.");return;}const {error}=await supabase.from("submissions").insert({campaign_id:campaignId,creator_id:user.id,post_url:url,platform,note});if(error)setError(error.message);else setDone(true);}
  return <main className="wrap" style={{maxWidth:650}}><div className="card"><h1>Submit Clip</h1>{campaign?<p className="muted">Campaign: {campaign.title}</p>:null}{done?<div className="notice">Submission berhasil dikirim untuk review admin.</div>:<form onSubmit={submit}><label>Platform</label><select value={platform} onChange={e=>setPlatform(e.target.value)}><option>TikTok</option><option>Instagram</option><option>YouTube</option></select><label>Link postingan</label><input required placeholder="https://..." value={url} onChange={e=>setUrl(e.target.value)}/><label>Catatan</label><textarea placeholder="Opsional" value={note} onChange={e=>setNote(e.target.value)}/>{error&&<p className="notice">{error}</p>}<button className="btn">Kirim Submission</button></form>}</div></main>
}
export default function Submit(){return <Suspense fallback={<main className="wrap"><div className="card">Loading...</div></main>}><SubmitForm/></Suspense>}
