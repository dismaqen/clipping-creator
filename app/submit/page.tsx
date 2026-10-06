"use client";

import { Suspense, useSearchParams, useState } from "react";

function SubmitForm() {
  const q = useSearchParams();
  const campaign = q.get("campaign") || "Campaign";
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  return (
    <main className="wrap" style={{ maxWidth: 650 }}>
      <div className="card">
        <h1>Submit Clip</h1>
        <p className="muted">Campaign: {campaign}</p>
        {done ? (
          <div className="notice">
            Submission diterima untuk review admin. Di versi production, data ini akan masuk database Supabase.
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
          >
            <label>Link TikTok / Instagram / YouTube</label>
            <input
              required
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <label>Catatan</label>
            <textarea
              placeholder="Opsional"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button className="btn">Kirim Submission</button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function Submit() {
  return (
    <Suspense
      fallback={
        <main className="wrap" style={{ maxWidth: 650 }}>
          <div className="card">Loading...</div>
        </main>
      }
    >
      <SubmitForm />
    </Suspense>
  );
}
