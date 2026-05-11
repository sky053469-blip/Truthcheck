import { useState, useRef } from "react";

const SYS = `You are TruthCheck AI. Fact-check the given claim using web_search (max 2 searches).
Return ONLY this JSON structure, no markdown, no extra text:
{"verdict":"REAL","confidence":85,"credibilityScore":80,"summary":"Short 2 sentence summary.","claims":[{"claim":"claim text","status":"VERIFIED","explanation":"explanation","source":"Reuters"}],"redFlags":["flag"],"positiveIndicators":["signal"],"sourcesChecked":["Reuters"],"recommendation":"advice for reader","category":"Politics","searchInsights":"key finding"}
verdict options: REAL, FAKE, MISLEADING, UNVERIFIED
status options: VERIFIED, FALSE, MISLEADING, UNVERIFIED`;

const G = {
  green:"#00B67A",gdk:"#008C5E",glt:"#E6F8F2",
  navy:"#1A2B4A",nlt:"#2D4470",
  gray:"#6B7280",grayLt:"#F9FAFB",grayBd:"#E5E7EB",
  white:"#FFFFFF",text:"#1F2937",soft:"#4B5563",
};

const VD = {
  REAL:      {label:"Real",       color:"#00B67A",bg:"#E6F8F2",border:"#A7EDD6",icon:"✓"},
  FAKE:      {label:"Fake",       color:"#EF4444",bg:"#FEF2F2",border:"#FECACA",icon:"✕"},
  MISLEADING:{label:"Misleading", color:"#F59E0B",bg:"#FFFBEB",border:"#FDE68A",icon:"!"},
  UNVERIFIED:{label:"Unverified", color:"#8B5CF6",bg:"#F5F3FF",border:"#DDD6FE",icon:"?"},
};

const ST = {
  VERIFIED:  {color:"#00B67A",icon:"✓"},
  FALSE:     {color:"#EF4444",icon:"✕"},
  MISLEADING:{color:"#F59E0B",icon:"!"},
  UNVERIFIED:{color:"#8B5CF6",icon:"?"},
};

function Logo({ onClick, light }) {
  return (
    <button onClick={onClick} style={{background:"none",border:"none",cursor:onClick?"pointer":"default",padding:0,display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:38,height:38,background:light?"rgba(255,255,255,.15)":G.green,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 2L3 6.5v5.5c0 4.8 3.3 9.3 8 10.4 4.7-1.1 8-5.6 8-10.4V6.5L11 2z" stroke="white" strokeWidth="1.6" fill="none"/>
          <path d="M7.5 11l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span style={{fontFamily:"'Poppins',sans-serif",fontSize:21,fontWeight:700,color:light?"#fff":G.navy,letterSpacing:-.3}}>
        Truth<span style={{color:light?"#6EE7C0":G.green}}>Check</span>
      </span>
    </button>
  );
}

function Pill({ color, children }) {
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,background:`${color}18`,border:`1px solid ${color}40`,borderRadius:20,padding:"3px 12px",fontSize:12,color,fontWeight:600}}>{children}</span>;
}

function ConfBar({ label, value, color }) {
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:12,color:G.soft}}>{label}</span>
        <span style={{fontSize:12,fontWeight:700,color}}>{value}%</span>
      </div>
      <div style={{height:5,background:"#F3F4F6",borderRadius:99,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${value}%`,background:color,borderRadius:99,transition:"width .9s ease"}}/>
      </div>
    </div>
  );
}

function Spinner({ elapsed }) {
  const steps = ["Extracting claims","Searching live sources","Cross-referencing","Reasoning","Finalising verdict"];
  const idx = Math.min(Math.floor(elapsed/1800), steps.length-1);
  return (
    <div style={{background:G.white,border:`1px solid ${G.grayBd}`,borderRadius:18,padding:"26px 22px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:G.green,animation:"pulse 1s infinite"}}/>
          <span style={{fontSize:13,color:G.green,fontWeight:700}}>Live web search active</span>
        </div>
        <span style={{fontFamily:"monospace",fontSize:13,color:G.gray,fontWeight:600}}>{(elapsed/1000).toFixed(1)}s</span>
      </div>
      {steps.map((s,i)=>{
        const done=i<idx, active=i===idx;
        return (
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:i<steps.length-1?14:0}}>
            <div style={{width:24,height:24,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
              background:done?G.green:active?G.glt:"#F9FAFB",
              border:done?`2px solid ${G.green}`:active?`2px solid ${G.green}`:`2px solid ${G.grayBd}`,
              boxShadow:active?`0 0 0 3px ${G.green}22`:"none",transition:"all .3s"}}>
              {done ? <span style={{color:"#fff",fontSize:11,fontWeight:900}}>✓</span>
                    : active ? <span style={{width:7,height:7,borderRadius:"50%",background:G.green,display:"block",animation:"pulse 1s infinite"}}/>
                    : <span style={{width:5,height:5,borderRadius:"50%",background:G.grayBd,display:"block"}}/>}
            </div>
            <span style={{fontSize:14,fontWeight:active?600:400,color:done?G.green:active?G.navy:"#D1D5DB",transition:"color .3s"}}>
              {s}{active&&<span style={{animation:"dotBlink 1s infinite"}}>…</span>}
            </span>
          </div>
        );
      })}
      <div style={{height:4,background:G.grayBd,borderRadius:99,marginTop:18,overflow:"hidden"}}>
        <div style={{height:"100%",background:`linear-gradient(90deg,${G.green},${G.navy})`,borderRadius:99,width:`${Math.min(93,(elapsed/9000)*100)}%`,transition:"width .6s ease"}}/>
      </div>
    </div>
  );
}

function Result({ r }) {
  const vc = VD[r.verdict] || VD.UNVERIFIED;
  const cc = r.credibilityScore>70 ? G.green : r.credibilityScore>40 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{animation:"fadeUp .4s ease"}}>
      {/* Hero */}
      <div style={{background:`linear-gradient(135deg,${G.navy},${G.nlt})`,borderRadius:20,padding:"28px 22px",marginBottom:14,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:150,height:150,borderRadius:"50%",background:`${vc.color}15`,pointerEvents:"none"}}/>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.1)",borderRadius:20,padding:"3px 14px",marginBottom:18}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:G.green,animation:"pulse 1.5s infinite"}}/>
          <span style={{fontSize:10,color:"rgba(255,255,255,.8)",letterSpacing:2,fontWeight:600}}>VERIFIED WITH LIVE WEB SEARCH</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
          <div style={{width:64,height:64,borderRadius:"50%",background:vc.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,color:"#fff",fontWeight:900,flexShrink:0,boxShadow:`0 6px 20px ${vc.color}50`}}>
            {vc.icon}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:vc.color,fontWeight:700,letterSpacing:3,marginBottom:3}}>{r.verdict}</div>
            <div style={{fontFamily:"'Poppins',sans-serif",fontSize:30,fontWeight:800,color:"#fff",lineHeight:1}}>{vc.label}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.45)",marginTop:5}}>{r.category} · {r.confidence}% confidence</div>
          </div>
          <svg width="66" height="66" viewBox="0 0 66 66" style={{flexShrink:0}}>
            <circle cx="33" cy="33" r="27" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="6"/>
            <circle cx="33" cy="33" r="27" fill="none" stroke={vc.color} strokeWidth="6"
              strokeDasharray={`${(r.confidence/100)*170} 170`} strokeDashoffset="42" strokeLinecap="round"
              style={{transition:"stroke-dasharray 1.2s ease"}}/>
            <text x="33" y="37" textAnchor="middle" fill={vc.color} fontSize="13" fontWeight="800">{r.confidence}</text>
          </svg>
        </div>
        <p style={{fontSize:14,color:"rgba(255,255,255,.75)",lineHeight:1.8,marginTop:20,marginBottom:0}}>{r.summary}</p>
        {r.searchInsights&&(
          <div style={{marginTop:12,padding:"10px 14px",background:"rgba(255,255,255,.07)",borderLeft:`3px solid ${G.green}`,borderRadius:"0 8px 8px 0",fontSize:13,color:"rgba(255,255,255,.6)",lineHeight:1.6}}>
            <span style={{color:G.green,fontWeight:700}}>🌐 </span>{r.searchInsights}
          </div>
        )}
      </div>

      {/* Metrics */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div style={{background:G.white,border:`1px solid ${G.grayBd}`,borderRadius:16,padding:"16px",boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
          <div style={{fontSize:10,color:G.gray,letterSpacing:2,fontWeight:700,marginBottom:12}}>ACCURACY METRICS</div>
          <ConfBar label="AI Confidence" value={r.confidence} color={G.navy}/>
          <ConfBar label="Credibility" value={r.credibilityScore} color={cc}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:12,padding:"12px",flex:1}}>
            <div style={{fontSize:10,color:"#EF4444",letterSpacing:2,fontWeight:700,marginBottom:7}}>⚠ RED FLAGS</div>
            {r.redFlags?.length ? r.redFlags.slice(0,3).map((f,i)=><div key={i} style={{fontSize:11,color:"#991B1B",marginBottom:4,lineHeight:1.5}}>— {f}</div>) : <div style={{fontSize:11,color:G.gray}}>None detected</div>}
          </div>
          <div style={{background:G.glt,border:`1px solid ${G.green}40`,borderRadius:12,padding:"12px",flex:1}}>
            <div style={{fontSize:10,color:G.gdk,letterSpacing:2,fontWeight:700,marginBottom:7}}>✓ SIGNALS</div>
            {r.positiveIndicators?.length ? r.positiveIndicators.slice(0,3).map((p,i)=><div key={i} style={{fontSize:11,color:G.gdk,marginBottom:4,lineHeight:1.5}}>— {p}</div>) : <div style={{fontSize:11,color:G.gray}}>None found</div>}
          </div>
        </div>
      </div>

      {/* Sources */}
      {r.sourcesChecked?.length>0&&(
        <div style={{background:G.white,border:`1px solid ${G.grayBd}`,borderRadius:14,padding:"14px 16px",marginBottom:12,boxShadow:"0 1px 6px rgba(0,0,0,.03)"}}>
          <div style={{fontSize:10,color:G.gray,letterSpacing:2,fontWeight:700,marginBottom:10}}>🌐 SOURCES SEARCHED</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {r.sourcesChecked.map((s,i)=><span key={i} style={{background:G.glt,border:`1px solid ${G.green}50`,borderRadius:20,padding:"3px 12px",fontSize:11,color:G.gdk,fontWeight:500}}>{s}</span>)}
          </div>
        </div>
      )}

      {/* Claims */}
      {r.claims?.length>0&&(
        <div style={{background:G.white,border:`1px solid ${G.grayBd}`,borderRadius:16,padding:"18px 16px",marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
          <div style={{fontSize:10,color:G.gray,letterSpacing:2,fontWeight:700,marginBottom:14}}>CLAIM-BY-CLAIM BREAKDOWN</div>
          {r.claims.map((c,i)=>{
            const sc=ST[c.status]||ST.UNVERIFIED, last=i===r.claims.length-1;
            return (
              <div key={i} style={{borderLeft:`3px solid ${sc.color}`,paddingLeft:12,marginBottom:last?0:16,paddingBottom:last?0:16,borderBottom:last?"none":`1px solid ${G.grayLt}`}}>
                <Pill color={sc.color}>{sc.icon} {c.status}</Pill>
                <div style={{fontSize:13,color:G.navy,fontWeight:600,margin:"7px 0 4px",lineHeight:1.5}}>"{c.claim}"</div>
                <div style={{fontSize:12,color:G.soft,lineHeight:1.65}}>{c.explanation}</div>
                {c.source&&<div style={{fontSize:10,color:G.gray,marginTop:4,fontFamily:"monospace"}}>↗ {c.source}</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendation */}
      {r.recommendation&&(
        <div style={{background:`linear-gradient(135deg,${G.green},${G.gdk})`,borderRadius:16,padding:"18px 20px",boxShadow:`0 6px 18px ${G.green}40`}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,.7)",letterSpacing:2,fontWeight:700,marginBottom:6}}>💡 RECOMMENDATION</div>
          <div style={{fontSize:14,color:"#fff",lineHeight:1.75,fontWeight:500}}>{r.recommendation}</div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [page,    setPage]    = useState("home");
  const [mode,    setMode]    = useState("text");
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);
  const [imgData, setImgData] = useState(null);
  const [imgPrev, setImgPrev] = useState(null);
  const [stats,   setStats]   = useState({total:0,real:0,fake:0,unverified:0});
  const clockRef = useRef(null);
  const startRef = useRef(null);
  const fileRef  = useRef(null);

  const reset = () => { setResult(null); setError(null); setInput(""); setImgData(null); setImgPrev(null); setElapsed(0); };

  function handleFile(e) {
    const f=e.target.files[0]; if(!f) return;
    setImgPrev(URL.createObjectURL(f));
    const rd=new FileReader();
    rd.onload=ev=>setImgData(ev.target.result.split(",")[1]);
    rd.readAsDataURL(f);
  }

  async function verify() {
    if (loading) return;
    if (mode!=="image"&&!input.trim()) return;
    if (mode==="image"&&!imgData) return;
    setLoading(true); setResult(null); setError(null); setElapsed(0);
    startRef.current=Date.now();
    clockRef.current=setInterval(()=>setElapsed(Date.now()-startRef.current),150);
    try {
      const userMsg = imgData
        ? [{type:"image",source:{type:"base64",media_type:"image/jpeg",data:imgData}},{type:"text",text:"Fact-check claims in this image. Use web_search. Return JSON only."}]
        : mode==="url"
          ? `Fact-check this URL using web_search. Return JSON only: ${input}`
          : `Fact-check this using web_search. Return JSON only:\n\n${input}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYS,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: userMsg }],
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`API error ${response.status}: ${errBody.slice(0,200)}`);
      }

      const data = await response.json();

      // Get all text blocks from response
      const textBlocks = (data.content || []).filter(b => b.type === "text");
      if (textBlocks.length === 0) throw new Error("No text in response. Try a simpler claim.");

      const fullText = textBlocks.map(b => b.text).join("");

      // Find JSON in the text
      const start = fullText.indexOf("{");
      const end = fullText.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("Could not parse response. Please try again.");

      const jsonStr = fullText.slice(start, end + 1);
      const parsed = JSON.parse(jsonStr);

      if (!parsed.verdict || !VD[parsed.verdict]) throw new Error("Invalid verdict in response.");

      setResult(parsed);
      setStats(s=>({
        total:s.total+1,
        real:s.real+(parsed.verdict==="REAL"?1:0),
        fake:s.fake+(parsed.verdict==="FAKE"?1:0),
        unverified:s.unverified+(parsed.verdict==="UNVERIFIED"?1:0),
      }));
    } catch(e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      clearInterval(clockRef.current);
      setLoading(false);
    }
  }

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (page==="home") return (
    <div style={{minHeight:"100vh",background:G.white,fontFamily:"'DM Sans',sans-serif",color:G.text,overflowX:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>

      <nav style={{background:G.white,borderBottom:`1px solid ${G.grayBd}`,padding:"0 20px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 12px rgba(0,0,0,.06)"}}>
        <Logo/>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:6,background:G.glt,border:`1px solid ${G.green}40`,borderRadius:20,padding:"4px 12px"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:G.green,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:11,color:G.gdk,fontWeight:600,letterSpacing:1}}>LIVE</span>
          </div>
          <button onClick={()=>setPage("verify")} style={{background:G.green,color:"#fff",border:"none",padding:"10px 22px",borderRadius:25,fontFamily:"inherit",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 14px ${G.green}50`}}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{background:`linear-gradient(155deg,${G.navy},${G.nlt})`,padding:"80px 20px 72px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-80,right:-80,width:360,height:360,borderRadius:"50%",background:`${G.green}12`,pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-60,left:-60,width:260,height:260,borderRadius:"50%",background:"rgba(255,107,53,.07)",pointerEvents:"none"}}/>
        <div style={{maxWidth:640,margin:"0 auto",textAlign:"center",position:"relative"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)",borderRadius:25,padding:"6px 18px",marginBottom:28}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:G.green,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:11,color:"rgba(255,255,255,.8)",letterSpacing:2,fontWeight:600}}>LIVE · AI · REAL-TIME WEB SEARCH</span>
          </div>
          <h1 style={{fontFamily:"'Poppins',sans-serif",fontSize:"clamp(36px,8vw,60px)",fontWeight:900,color:"#fff",lineHeight:1.08,margin:"0 0 10px"}}>
            Stop believing.<br/>
            <span style={{color:G.green,position:"relative",display:"inline-block"}}>
              Start verifying.
              <svg style={{position:"absolute",bottom:-6,left:0,width:"100%"}} viewBox="0 0 300 10" preserveAspectRatio="none" height="8">
                <path d="M0 5 Q75 0 150 5 Q225 10 300 5" stroke="#FFC107" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>
          <p style={{fontSize:17,color:"rgba(255,255,255,.62)",lineHeight:1.8,margin:"24px auto 36px",maxWidth:500}}>
            Paste any news, tweet, or article. Our AI searches the live web and tells you if it's <strong style={{color:G.green}}>real</strong>, <strong style={{color:"#EF4444"}}>fake</strong>, or <strong style={{color:"#F59E0B"}}>misleading</strong> — in seconds.
          </p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>setPage("verify")} style={{background:G.green,color:"#fff",border:"none",padding:"16px 34px",borderRadius:30,fontFamily:"inherit",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:`0 8px 28px ${G.green}60`}}>
              Verify a claim free →
            </button>
            <button onClick={()=>setPage("verify")} style={{background:"rgba(255,255,255,.1)",color:"#fff",border:"1px solid rgba(255,255,255,.25)",padding:"16px 28px",borderRadius:30,fontFamily:"inherit",fontSize:15,cursor:"pointer"}}>
              See how it works
            </button>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:32,marginTop:48,flexWrap:"wrap"}}>
            {[["⚡ ~6s","Avg speed"],["4.9★","Trustpilot"],["200K+","Claims verified"],["80+","Countries"]].map(([v,l])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Poppins',sans-serif",fontSize:20,fontWeight:800,color:G.green}}>{v}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.38)",marginTop:3}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      {stats.total>0&&(
        <section style={{background:G.grayLt,borderBottom:`1px solid ${G.grayBd}`}}>
          <div style={{maxWidth:600,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)"}}>
            {[["Verified",stats.total,G.navy],["Real",stats.real,G.green],["Fake",stats.fake,"#EF4444"],["Unverified",stats.unverified,"#8B5CF6"]].map(([l,v,c])=>(
              <div key={l} style={{textAlign:"center",padding:"24px 10px",borderRight:`1px solid ${G.grayBd}`}}>
                <div style={{fontFamily:"'Poppins',sans-serif",fontSize:36,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
                <div style={{fontSize:12,color:G.gray,marginTop:5}}>{l}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* VERDICTS */}
      <section style={{background:G.white,padding:"72px 20px"}}>
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:40}}>
            <div style={{display:"inline-block",background:`${G.navy}10`,border:`1px solid ${G.navy}20`,borderRadius:20,padding:"4px 14px",marginBottom:16}}>
              <span style={{fontSize:12,color:G.navy,fontWeight:700,letterSpacing:1}}>FOUR VERDICTS</span>
            </div>
            <h2 style={{fontFamily:"'Poppins',sans-serif",fontSize:"clamp(26px,5vw,40px)",fontWeight:800,color:G.navy,lineHeight:1.15}}>
              Honesty over false certainty.
            </h2>
            <p style={{fontSize:15,color:G.soft,marginTop:12,lineHeight:1.7,maxWidth:440,margin:"12px auto 0"}}>
              We don't pretend to know everything. If we can't confirm it, we say so.
            </p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {[
              {icon:"✓",bg:"#DCFCE7",c:G.green,  label:"REAL",       title:"Real",       desc:"Claim aligns with verified facts. We show exactly what corroborates it."},
              {icon:"✕",bg:"#FEE2E2",c:"#EF4444", label:"FAKE",       title:"Fake",       desc:"Claim is contradicted by evidence or shows hallmarks of misinformation."},
              {icon:"!",bg:"#FEF3C7",c:"#F59E0B", label:"MISLEADING", title:"Misleading", desc:"Some facts are true but context is missing or framed to deceive."},
              {icon:"?",bg:"#EDE9FE",c:"#8B5CF6", label:"UNVERIFIED", title:"Unverified", desc:"Insufficient evidence found. We won't guess — honesty matters."},
            ].map(v=>(
              <div key={v.label} style={{background:G.white,border:`1px solid ${G.grayBd}`,borderRadius:16,padding:"22px 18px",boxShadow:"0 2px 10px rgba(0,0,0,.05)",borderTop:`3px solid ${v.c}`,transition:"transform .2s,box-shadow .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 10px 24px rgba(0,0,0,.09)"}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,.05)"}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:v.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:v.c,marginBottom:12}}>{v.icon}</div>
                <div style={{fontSize:10,color:v.c,fontWeight:700,letterSpacing:2,marginBottom:4}}>{v.label}</div>
                <div style={{fontFamily:"'Poppins',sans-serif",fontSize:16,fontWeight:700,color:G.navy,marginBottom:7}}>{v.title}</div>
                <div style={{fontSize:13,color:G.soft,lineHeight:1.65}}>{v.desc}</div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:32}}>
            <button onClick={()=>setPage("verify")} style={{background:G.green,color:"#fff",border:"none",padding:"14px 32px",borderRadius:25,fontFamily:"inherit",fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 16px ${G.green}50`}}>
              Try it free now →
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{background:`linear-gradient(135deg,${G.navy},${G.nlt})`,padding:"80px 20px",textAlign:"center"}}>
        <div style={{maxWidth:520,margin:"0 auto"}}>
          <h2 style={{fontFamily:"'Poppins',sans-serif",fontSize:"clamp(30px,6vw,52px)",fontWeight:900,color:"#fff",lineHeight:1.08,marginBottom:8}}>
            Misinformation moves fast.
          </h2>
          <h2 style={{fontFamily:"'Poppins',sans-serif",fontSize:"clamp(30px,6vw,52px)",fontWeight:900,color:G.green,lineHeight:1.08,marginBottom:26}}>
            You can move faster.
          </h2>
          <p style={{fontSize:15,color:"rgba(255,255,255,.52)",lineHeight:1.8,marginBottom:34}}>
            Free forever for individual use.<br/>No credit card. Start verifying now.
          </p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>setPage("verify")} style={{background:G.green,color:"#fff",border:"none",padding:"16px 36px",borderRadius:30,fontFamily:"inherit",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:`0 8px 28px ${G.green}55`}}>
              Run a free verification →
            </button>
            <button onClick={()=>setPage("verify")} style={{background:"rgba(255,255,255,.1)",color:"#fff",border:"1px solid rgba(255,255,255,.2)",padding:"16px 28px",borderRadius:30,fontFamily:"inherit",fontSize:14,cursor:"pointer"}}>
              Create account
            </button>
          </div>
        </div>
      </section>

      <footer style={{background:G.navy,borderTop:"1px solid rgba(255,255,255,.06)",padding:"20px",textAlign:"center"}}>
        <span style={{fontSize:11,color:"rgba(255,255,255,.2)",letterSpacing:1}}>© 2026 TRUTHCHECK · AI-POWERED · REAL-TIME WEB VERIFICATION</span>
      </footer>

      <style>{`
        @keyframes pulse   {0%,100%{opacity:1}50%{opacity:.25}}
        @keyframes fadeUp  {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dotBlink{0%,100%{opacity:1}50%{opacity:0}}
        *{box-sizing:border-box;margin:0;padding:0;}
      `}</style>
    </div>
  );

  // ── VERIFIER ──────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:G.grayLt,fontFamily:"'DM Sans',sans-serif",color:G.text}}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>

      <nav style={{background:G.white,borderBottom:`1px solid ${G.grayBd}`,padding:"0 20px",height:62,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 10px rgba(0,0,0,.06)"}}>
        <Logo onClick={()=>{setPage("home");reset();}}/>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {loading&&<span style={{fontFamily:"monospace",fontSize:12,color:G.green,fontWeight:700}}>{(elapsed/1000).toFixed(1)}s</span>}
          <Pill color={G.green}>🌐 LIVE SEARCH</Pill>
        </div>
      </nav>

      <div style={{maxWidth:660,margin:"0 auto",padding:"30px 18px 80px"}}>
        <div style={{marginBottom:24}}>
          <h1 style={{fontFamily:"'Poppins',sans-serif",fontSize:28,fontWeight:800,color:G.navy,marginBottom:4}}>Verify a Claim</h1>
          <p style={{fontSize:13,color:G.gray}}>Paste text, a URL, or upload an image — we search live sources and give you a verdict.</p>
        </div>

        {/* Tabs */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",background:G.white,border:`1px solid ${G.grayBd}`,borderRadius:14,overflow:"hidden",marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,.05)"}}>
          {[["text","📄","Text"],["url","🔗","URL"],["image","🖼️","Image"]].map(([m,icon,label],i)=>(
            <button key={m} onClick={()=>{setMode(m);reset();}}
              style={{padding:"14px 6px",border:"none",borderRight:i<2?`1px solid ${G.grayBd}`:"none",background:mode===m?G.glt:G.white,color:mode===m?G.gdk:G.gray,fontFamily:"inherit",fontSize:13,fontWeight:mode===m?700:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,borderBottom:mode===m?`2px solid ${G.green}`:"2px solid transparent",transition:"all .15s"}}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{background:G.white,border:`1px solid ${G.grayBd}`,borderRadius:18,overflow:"hidden",marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,.06)"}}>
          {mode==="text"&&(
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.ctrlKey&&e.key==="Enter")verify();}}
              placeholder="Paste a headline, tweet, article excerpt, or any claim to verify…"
              style={{width:"100%",minHeight:150,border:"none",outline:"none",padding:"20px",fontFamily:"'DM Sans',sans-serif",fontSize:14,color:G.navy,lineHeight:1.75,resize:"vertical",boxSizing:"border-box"}}/>
          )}
          {mode==="url"&&(
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter")verify();}}
              placeholder="https://example.com/article-to-verify…"
              style={{width:"100%",border:"none",outline:"none",padding:"20px",fontFamily:"'DM Sans',sans-serif",fontSize:14,color:G.navy,boxSizing:"border-box"}}/>
          )}
          {mode==="image"&&(
            <div>
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
              {imgPrev
                ?<div style={{padding:18}}>
                    <img src={imgPrev} alt="u" style={{maxWidth:"100%",maxHeight:220,objectFit:"contain",display:"block",borderRadius:10,marginBottom:10}}/>
                    <button onClick={()=>{setImgData(null);setImgPrev(null);}} style={{fontSize:12,color:"#EF4444",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>✕ Remove</button>
                  </div>
                :<div onClick={()=>fileRef.current.click()} style={{padding:"46px 16px",textAlign:"center",cursor:"pointer"}}>
                    <div style={{width:60,height:60,borderRadius:"50%",background:G.glt,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 14px"}}>🖼️</div>
                    <div style={{fontSize:14,color:G.navy,fontWeight:600,marginBottom:4}}>Drop an image or click to upload</div>
                    <div style={{fontSize:12,color:G.gray}}>Screenshots, memes, photographs</div>
                  </div>}
            </div>
          )}
          <div style={{padding:"12px 18px",borderTop:`1px solid ${G.grayLt}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:"#FAFAFA"}}>
            <span style={{fontSize:11,color:G.grayBd,fontFamily:"monospace"}}>
              {mode==="text"?`${input.length} chars · Ctrl+Enter`:mode==="url"?"paste full URL":imgData?"✓ image ready":"no image"}
            </span>
            <div style={{display:"flex",gap:8}}>
              <button onClick={reset} style={{background:"none",border:`1px solid ${G.grayBd}`,color:G.gray,padding:"9px 16px",fontSize:12,cursor:"pointer",fontFamily:"inherit",borderRadius:20}}>Clear</button>
              <button onClick={verify} disabled={loading||(mode!=="image"&&!input.trim())||(mode==="image"&&!imgData)}
                style={{background:loading?G.gdk:G.green,color:"#fff",border:"none",padding:"9px 26px",fontSize:13,fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",borderRadius:20,boxShadow:`0 3px 14px ${G.green}50`,display:"flex",alignItems:"center",gap:7,opacity:loading?.85:1,transition:"all .2s"}}>
                {loading
                  ?<><span style={{display:"flex",gap:3}}>{[0,1,2].map(i=><span key={i} style={{width:3,height:12,background:"#fff",borderRadius:2,display:"block",animation:`wave .7s ease-in-out ${i*.15}s infinite alternate`}}/>)}</span>Verifying…</>
                  :"Verify →"}
              </button>
            </div>
          </div>
        </div>

        {loading&&<div style={{marginBottom:14}}><Spinner elapsed={elapsed}/></div>}

        {error&&(
          <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:14,padding:"16px 18px",marginBottom:14,color:"#991B1B",fontSize:13,borderLeft:"3px solid #EF4444",lineHeight:1.7}}>
            ⚠ {error}
          </div>
        )}

        {result&&<Result r={result}/>}

        {result&&(
          <button onClick={reset} style={{width:"100%",background:G.white,border:`1px solid ${G.grayBd}`,padding:"14px",fontSize:13,fontWeight:600,color:G.navy,cursor:"pointer",fontFamily:"inherit",borderRadius:14,marginTop:14,boxShadow:"0 1px 6px rgba(0,0,0,.04)"}}>
            Verify another claim →
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulse   {0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes wave    {from{transform:scaleY(.2)}to{transform:scaleY(1)}}
        @keyframes fadeUp  {from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dotBlink{0%,100%{opacity:1}50%{opacity:0}}
        *{box-sizing:border-box;margin:0;padding:0;}
        textarea::placeholder,input::placeholder{color:#D1D5DB;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#E5E7EB;border-radius:2px;}
      `}</style>
    </div>
  );
}
