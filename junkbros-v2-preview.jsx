import { useState } from "react";

const ACCENT = "#f97316";
const CREW = "#22d3ee";
const GREEN = "#22c55e";
const RED = "#ef4444";
const BG = "#080810";
const CARD = "#0e0e1c";
const BORDER = "#1a1a2e";

const JOB_TYPES = ["Junk Removal", "Hauling", "Painting", "Handyman", "Moving", "Yard Debris", "Hot Tub/Appliance"];
const STATUSES = ["completed", "in-progress", "pending"];

function Tag({ label, color }) {
  return (
    <span style={{
      background: color + "20", border: `1px solid ${color}40`,
      color, borderRadius: 4, padding: "2px 8px", fontSize: 10,
      letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700,
    }}>{label}</span>
  );
}

function StatCard({ label, value, accent, sub }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 9, color: "#4b5563", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: accent, fontFamily: "'Courier New', monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#4b5563", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", half }) {
  return (
    <div style={{ marginBottom: 12, width: half ? "calc(50% - 6px)" : "100%" }}>
      <div style={{ fontSize: 9, color: "#4b5563", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{
        width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8,
        padding: "10px 12px", color: "#e5e7eb", fontSize: 13,
        fontFamily: "'Courier New', monospace", boxSizing: "border-box", outline: "none",
      }} />
    </div>
  );
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_JOBS = [
  { id: 1, title: "Hot Tub Removal", customer: "Marilyn", address: "Palm Harbor, FL", type: "Hot Tub/Appliance", revenue: 350, dumpFee: 35, laynePayDay: 80, mileage: 12, status: "completed", date: new Date().toISOString(), loggedBy: "tyler", notes: "Heavy, needed straps", repeat: true },
  { id: 2, title: "Full House Cleanout", customer: "Sherry", address: "Tarpon Springs, FL", type: "Junk Removal", revenue: 650, dumpFee: 70, laynePayDay: 120, mileage: 18, status: "completed", date: new Date(Date.now() - 86400000).toISOString(), loggedBy: "tyler", notes: "", repeat: true },
  { id: 3, title: "Yard Debris Haul", customer: "Heidi", address: "New Port Richey, FL", type: "Yard Debris", revenue: 200, dumpFee: 35, laynePayDay: 50, mileage: 8, status: "completed", date: new Date(Date.now() - 172800000).toISOString(), loggedBy: "layne", notes: "Logs and brush", repeat: false },
  { id: 4, title: "3-Car Garage Cleanout", customer: "Jim", address: "Dunedin, FL", type: "Junk Removal", revenue: 500, dumpFee: 70, laynePayDay: 100, mileage: 22, status: "in-progress", date: new Date().toISOString(), loggedBy: "tyler", notes: "Phase 1 of 4", repeat: false },
];

export default function JunkBrosV2() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [clockedIn, setClockedIn] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const [checklist, setChecklist] = useState({
    trailer: false, spray: false, gloves: false, bags: false, straps: false, fuel: false,
  });
  const [form, setForm] = useState({
    title: "", customer: "", phone: "", address: "", type: JOB_TYPES[0],
    revenue: "", quote: "", dumpFee: "", laynePayDay: "", laynePercent: "",
    mileage: "", status: "completed", notes: "", repeat: false,
  });

  const totalRevenue = jobs.reduce((s, j) => s + j.revenue, 0);
  const totalDump = jobs.reduce((s, j) => s + (j.dumpFee || 0), 0);
  const totalPaid = jobs.reduce((s, j) => s + (j.laynePayDay || 0), 0);
  const profit = totalRevenue - totalDump - totalPaid;
  const margin = totalRevenue ? ((profit / totalRevenue) * 100).toFixed(0) : 0;
  const todayJobs = jobs.filter(j => new Date(j.date).toDateString() === new Date().toDateString());
  const layneTotal = jobs.reduce((s, j) => s + (j.laynePayDay || 0), 0);
  const layneWeek = jobs.filter(j => {
    const d = new Date(j.date);
    const now = new Date();
    const weekAgo = new Date(now - 7 * 86400000);
    return d >= weekAgo;
  }).reduce((s, j) => s + (j.laynePayDay || 0), 0);

  const byType = JOB_TYPES.map(t => ({
    type: t,
    count: jobs.filter(j => j.type === t).length,
    revenue: jobs.filter(j => j.type === t).reduce((s, j) => s + j.revenue, 0),
  })).filter(t => t.count > 0).sort((a, b) => b.revenue - a.revenue);

  function handleClock() {
    if (clockedIn) setClockedIn(null);
    else setClockedIn(new Date().toISOString());
  }

  function submitJob() {
    if (!form.title || !form.revenue) return;
    const layneAmt = form.laynePercent
      ? parseFloat(form.revenue) * (parseFloat(form.laynePercent) / 100)
      : parseFloat(form.laynePayDay || 0);
    const newJob = {
      id: Date.now(), ...form,
      revenue: parseFloat(form.revenue),
      quote: parseFloat(form.quote || form.revenue),
      dumpFee: parseFloat(form.dumpFee || 0),
      laynePayDay: layneAmt,
      mileage: parseFloat(form.mileage || 0),
      date: new Date().toISOString(),
      loggedBy: user,
    };
    setJobs(p => [newJob, ...p]);
    setForm({ title: "", customer: "", phone: "", address: "", type: JOB_TYPES[0], revenue: "", quote: "", dumpFee: "", laynePayDay: "", laynePercent: "", mileage: "", status: "completed", notes: "", repeat: false });
    setShowForm(false);
  }

  const fmt = n => "$" + Number(n || 0).toFixed(2);
  const fmtTime = iso => iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--";
  const fmtDate = iso => iso ? new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" }) : "--";
  const statusColor = s => s === "completed" ? GREEN : s === "in-progress" ? ACCENT : "#6b7280";

  if (!user) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace", padding: 24 }}>
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.4em", color: ACCENT, marginBottom: 6, textTransform: "uppercase" }}>Junk Bros FL LLC</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "0.04em" }}>CREW OS</div>
        <div style={{ fontSize: 11, color: "#374151", marginTop: 6, letterSpacing: "0.2em" }}>v2.0 PREVIEW</div>
        <div style={{ width: 48, height: 2, background: `linear-gradient(90deg, ${ACCENT}, ${CREW})`, margin: "14px auto 0", borderRadius: 2 }} />
      </div>
      <div style={{ width: "100%", maxWidth: 300, display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={() => setUser("tyler")} style={{
          background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT}10)`,
          border: `1px solid ${ACCENT}`, color: ACCENT, borderRadius: 12,
          padding: "18px 24px", fontSize: 14, fontWeight: 900, cursor: "pointer",
          letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Courier New', monospace",
          boxShadow: `0 0 40px ${ACCENT}20`,
        }}>🔑 Tyler — Owner</button>
        <button onClick={() => setUser("layne")} style={{
          background: `linear-gradient(135deg, ${CREW}20, ${CREW}10)`,
          border: `1px solid ${CREW}`, color: CREW, borderRadius: 12,
          padding: "18px 24px", fontSize: 14, fontWeight: 900, cursor: "pointer",
          letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Courier New', monospace",
          boxShadow: `0 0 40px ${CREW}20`,
        }}>🔧 Layne — Crew</button>
      </div>
    </div>
  );

  const isOwner = user === "tyler";
  const ac = isOwner ? ACCENT : CREW;
  const navItems = isOwner
    ? ["dashboard", "jobs", "stats", "checklist"]
    : ["dashboard", "jobs", "pay", "checklist"];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#e5e7eb", fontFamily: "'Courier New', monospace", paddingBottom: 90 }}>

      {/* Header */}
      <div style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 20 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: ac, textTransform: "uppercase" }}>Junk Bros FL</div>
          <div style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>{isOwner ? "Tyler" : "Layne"}</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={handleClock} style={{
            background: clockedIn ? RED + "20" : GREEN + "20",
            border: `1px solid ${clockedIn ? RED : GREEN}`,
            color: clockedIn ? RED : GREEN, borderRadius: 8,
            padding: "7px 14px", fontSize: 11, cursor: "pointer",
            fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: "0.08em",
          }}>
            {clockedIn ? `⏹ OUT ${fmtTime(clockedIn)}` : "▶ CLOCK IN"}
          </button>
          <button onClick={() => setUser(null)} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "#374151", borderRadius: 6, padding: "7px 10px", fontSize: 10, cursor: "pointer", fontFamily: "'Courier New', monospace" }}>↩</button>
        </div>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 500, margin: "0 auto" }}>

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div>
            <div style={{ fontSize: 9, color: "#374151", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 14 }}>
              {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
            </div>

            {isOwner ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                  <StatCard label="Net Profit" value={fmt(profit)} accent={GREEN} sub={`${margin}% margin`} />
                  <StatCard label="Total Revenue" value={fmt(totalRevenue)} accent={ACCENT} sub={`${jobs.length} jobs`} />
                  <StatCard label="Dump Fees" value={fmt(totalDump)} accent={RED} sub="total paid" />
                  <StatCard label="Layne Paid" value={fmt(totalPaid)} accent={CREW} sub="total" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  <StatCard label="Today Revenue" value={fmt(todayJobs.reduce((s,j)=>s+j.revenue,0))} accent={ACCENT} sub={`${todayJobs.length} jobs today`} />
                  <StatCard label="Avg Job Value" value={fmt(jobs.length ? totalRevenue / jobs.length : 0)} accent="#a78bfa" />
                </div>
              </>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                <StatCard label="This Week" value={fmt(layneWeek)} accent={CREW} sub="your pay" />
                <StatCard label="All Time" value={fmt(layneTotal)} accent={CREW} sub="total earned" />
                <StatCard label="Jobs Today" value={todayJobs.length} accent={ACCENT} />
                <StatCard label="Status" value={clockedIn ? "ON CLOCK" : "OFF"} accent={clockedIn ? GREEN : "#374151"} sub={clockedIn ? `Since ${fmtTime(clockedIn)}` : ""} />
              </div>
            )}

            <div style={{ fontSize: 9, color: "#374151", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 12 }}>Recent Jobs</div>
            {jobs.slice(0, 3).map(job => (
              <div key={job.id} onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)} style={{
                background: CARD, border: `1px solid ${expandedJob === job.id ? ac + "60" : BORDER}`,
                borderRadius: 12, padding: 14, marginBottom: 10, cursor: "pointer",
                transition: "border-color 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 3 }}>{job.title}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Tag label={job.type} color={ac} />
                      <Tag label={job.status} color={statusColor(job.status)} />
                      {job.repeat && <Tag label="REPEAT" color="#a78bfa" />}
                    </div>
                  </div>
                  {isOwner && <div style={{ fontSize: 16, fontWeight: 900, color: GREEN }}>{fmt(job.revenue)}</div>}
                  {!isOwner && <div style={{ fontSize: 16, fontWeight: 900, color: CREW }}>{fmt(job.laynePayDay)}</div>}
                </div>
                <div style={{ fontSize: 11, color: "#4b5563" }}>{job.customer} · {fmtDate(job.date)} · {job.mileage}mi</div>

                {expandedJob === job.id && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                    {job.address && <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>📍 {job.address}</div>}
                    {isOwner && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 9, color: "#4b5563", letterSpacing: "0.1em" }}>QUOTED</div>
                          <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 13 }}>{fmt(job.quote || job.revenue)}</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 9, color: "#4b5563", letterSpacing: "0.1em" }}>DUMP FEE</div>
                          <div style={{ color: RED, fontWeight: 700, fontSize: 13 }}>{fmt(job.dumpFee)}</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 9, color: "#4b5563", letterSpacing: "0.1em" }}>NET</div>
                          <div style={{ color: GREEN, fontWeight: 700, fontSize: 13 }}>{fmt(job.revenue - job.dumpFee - job.laynePayDay)}</div>
                        </div>
                      </div>
                    )}
                    {job.notes && <div style={{ fontSize: 11, color: "#6b7280", fontStyle: "italic" }}>"{job.notes}"</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* JOBS */}
        {view === "jobs" && (
          <div>
            <button onClick={() => setShowForm(!showForm)} style={{
              width: "100%", background: `linear-gradient(135deg, ${ac}20, ${ac}10)`,
              border: `1px solid ${ac}`, color: ac, borderRadius: 12,
              padding: 14, fontSize: 13, fontWeight: 900, cursor: "pointer",
              letterSpacing: "0.15em", textTransform: "uppercase",
              fontFamily: "'Courier New', monospace", marginBottom: 20,
            }}>+ LOG NEW JOB</button>

            {showForm && (
              <div style={{ background: CARD, border: `1px solid ${ac}50`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: ac, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16 }}>New Job Entry</div>

                <Input label="Job Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Hot tub removal" />
                <Input label="Customer Name" value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))} placeholder="Name" />
                <Input label="Customer Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="(727) 000-0000" type="tel" />
                <Input label="Address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Street, City" />

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, color: "#4b5563", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 5 }}>Job Type</div>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={{
                    width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8,
                    padding: "10px 12px", color: "#e5e7eb", fontSize: 13,
                    fontFamily: "'Courier New', monospace",
                  }}>
                    {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <Input label="Quoted $" value={form.quote} onChange={e => setForm(p => ({ ...p, quote: e.target.value }))} placeholder="0.00" type="number" half />
                  <Input label="Actual Revenue $ *" value={form.revenue} onChange={e => setForm(p => ({ ...p, revenue: e.target.value }))} placeholder="0.00" type="number" half />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <Input label="Dump Fee $" value={form.dumpFee} onChange={e => setForm(p => ({ ...p, dumpFee: e.target.value }))} placeholder="35.00" type="number" half />
                  <Input label="Mileage" value={form.mileage} onChange={e => setForm(p => ({ ...p, mileage: e.target.value }))} placeholder="0" type="number" half />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <Input label="Layne Pay $" value={form.laynePayDay} onChange={e => setForm(p => ({ ...p, laynePayDay: e.target.value, laynePercent: "" }))} placeholder="0.00" type="number" half />
                  <Input label="OR Layne %" value={form.laynePercent} onChange={e => setForm(p => ({ ...p, laynePercent: e.target.value, laynePayDay: "" }))} placeholder="e.g. 30" type="number" half />
                </div>

                {form.laynePercent && form.revenue && (
                  <div style={{ background: CREW + "10", border: `1px solid ${CREW}30`, borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: CREW }}>
                    Layne pay: {fmt(parseFloat(form.revenue) * (parseFloat(form.laynePercent) / 100))}
                  </div>
                )}

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, color: "#4b5563", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 5 }}>Status</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {STATUSES.map(s => (
                      <button key={s} onClick={() => setForm(p => ({ ...p, status: s }))} style={{
                        flex: 1, background: form.status === s ? statusColor(s) + "30" : "transparent",
                        border: `1px solid ${form.status === s ? statusColor(s) : BORDER}`,
                        color: form.status === s ? statusColor(s) : "#374151",
                        borderRadius: 8, padding: "8px 4px", fontSize: 10,
                        cursor: "pointer", fontFamily: "'Courier New', monospace",
                        letterSpacing: "0.05em", textTransform: "uppercase",
                      }}>{s}</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <input type="checkbox" checked={form.repeat} onChange={e => setForm(p => ({ ...p, repeat: e.target.checked }))} />
                    <span style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.1em" }}>REPEAT CUSTOMER</span>
                  </label>
                </div>

                <Input label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any details..." />

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={submitJob} style={{
                    flex: 1, background: ac, border: "none", color: "#080810",
                    borderRadius: 10, padding: 13, fontWeight: 900, cursor: "pointer",
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    fontFamily: "'Courier New', monospace", fontSize: 13,
                  }}>SAVE JOB</button>
                  <button onClick={() => setShowForm(false)} style={{
                    background: "transparent", border: `1px solid ${BORDER}`, color: "#374151",
                    borderRadius: 10, padding: "13px 16px", cursor: "pointer",
                    fontFamily: "'Courier New', monospace",
                  }}>✕</button>
                </div>
              </div>
            )}

            {jobs.map(job => (
              <div key={job.id} onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)} style={{
                background: CARD, border: `1px solid ${expandedJob === job.id ? ac + "60" : BORDER}`,
                borderRadius: 12, padding: 14, marginBottom: 10, cursor: "pointer",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{job.title}</div>
                  <div style={{ fontWeight: 900, color: isOwner ? GREEN : CREW, fontSize: 14 }}>
                    {isOwner ? fmt(job.revenue) : fmt(job.laynePayDay)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                  <Tag label={job.type} color={ac} />
                  <Tag label={job.status} color={statusColor(job.status)} />
                  {job.repeat && <Tag label="REPEAT" color="#a78bfa" />}
                </div>
                <div style={{ fontSize: 11, color: "#4b5563" }}>{job.customer} · {fmtDate(job.date)} · {job.mileage}mi · by {job.loggedBy}</div>

                {expandedJob === job.id && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                    {job.address && <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>📍 {job.address}</div>}
                    {job.phone && <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>📞 {job.phone}</div>}
                    {isOwner && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 8 }}>
                        {[
                          { l: "QUOTED", v: fmt(job.quote || job.revenue), c: "#a78bfa" },
                          { l: "ACTUAL", v: fmt(job.revenue), c: ACCENT },
                          { l: "DUMP", v: fmt(job.dumpFee), c: RED },
                          { l: "NET", v: fmt(job.revenue - (job.dumpFee||0) - job.laynePayDay), c: GREEN },
                        ].map(s => (
                          <div key={s.l} style={{ textAlign: "center", background: BG, borderRadius: 8, padding: 8 }}>
                            <div style={{ fontSize: 8, color: "#4b5563", letterSpacing: "0.1em" }}>{s.l}</div>
                            <div style={{ color: s.c, fontWeight: 700, fontSize: 12 }}>{s.v}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {job.notes && <div style={{ fontSize: 11, color: "#6b7280", fontStyle: "italic" }}>"{job.notes}"</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* STATS - Owner */}
        {view === "stats" && isOwner && (
          <div>
            <div style={{ fontSize: 9, color: "#374151", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16 }}>Business Overview</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              <StatCard label="Total Revenue" value={fmt(totalRevenue)} accent={ACCENT} />
              <StatCard label="Net Profit" value={fmt(profit)} accent={GREEN} sub={`${margin}% margin`} />
              <StatCard label="Total Dump Fees" value={fmt(totalDump)} accent={RED} />
              <StatCard label="Total Paid Out" value={fmt(totalPaid)} accent={CREW} />
              <StatCard label="Jobs Total" value={jobs.length} accent={ACCENT} />
              <StatCard label="Avg Job Value" value={fmt(jobs.length ? totalRevenue / jobs.length : 0)} accent="#a78bfa" />
              <StatCard label="Repeat Customers" value={jobs.filter(j=>j.repeat).length} accent="#a78bfa" />
              <StatCard label="Completed" value={jobs.filter(j=>j.status==="completed").length} accent={GREEN} />
            </div>

            <div style={{ fontSize: 9, color: "#374151", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 12 }}>Revenue by Job Type</div>
            {byType.map(t => (
              <div key={t.type} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 13 }}>{t.type}</div>
                  <div style={{ color: GREEN, fontWeight: 900 }}>{fmt(t.revenue)}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Tag label={`${t.count} jobs`} color={ACCENT} />
                  <Tag label={`${fmt(t.revenue / t.count)} avg`} color="#a78bfa" />
                </div>
                <div style={{ marginTop: 10, background: BG, borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(t.revenue / totalRevenue) * 100}%`, background: `linear-gradient(90deg, ${ACCENT}, ${GREEN})`, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAY - Layne */}
        {view === "pay" && !isOwner && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              <StatCard label="This Week" value={fmt(layneWeek)} accent={CREW} />
              <StatCard label="All Time" value={fmt(layneTotal)} accent={CREW} />
            </div>
            <div style={{ fontSize: 9, color: "#374151", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 12 }}>Pay History</div>
            {jobs.map(job => (
              <div key={job.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 13 }}>{job.title}</div>
                  <div style={{ fontSize: 11, color: "#4b5563", marginTop: 3 }}>{fmtDate(job.date)} · {job.customer}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: CREW }}>{fmt(job.laynePayDay)}</div>
              </div>
            ))}
          </div>
        )}

        {/* CHECKLIST */}
        {view === "checklist" && (
          <div>
            <div style={{ fontSize: 9, color: "#374151", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16 }}>Pre-Job Checklist</div>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20 }}>
              {[
                { key: "trailer", label: "Trailer hitched & secured", icon: "🔗" },
                { key: "fuel", label: "Truck fueled up", icon: "⛽" },
                { key: "straps", label: "Straps & tie downs loaded", icon: "🪢" },
                { key: "bags", label: "Contractor bags loaded", icon: "🗑" },
                { key: "gloves", label: "Gloves & PPE", icon: "🧤" },
                { key: "spray", label: "Roach spray if needed", icon: "🪳" },
              ].map(item => (
                <div key={item.key} onClick={() => setChecklist(p => ({ ...p, [item.key]: !p[item.key] }))} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 0",
                  borderBottom: `1px solid ${BORDER}`, cursor: "pointer",
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: checklist[item.key] ? GREEN : "transparent",
                    border: `2px solid ${checklist[item.key] ? GREEN : "#374151"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, flexShrink: 0, transition: "all 0.15s",
                  }}>{checklist[item.key] ? "✓" : ""}</div>
                  <div style={{ fontSize: 13, color: checklist[item.key] ? "#4b5563" : "#e5e7eb", textDecoration: checklist[item.key] ? "line-through" : "none" }}>
                    {item.icon} {item.label}
                  </div>
                </div>
              ))}
              <div style={{ paddingTop: 14, fontSize: 11, color: "#374151", textAlign: "center", letterSpacing: "0.15em" }}>
                {Object.values(checklist).filter(Boolean).length} / {Object.keys(checklist).length} COMPLETE
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: CARD, borderTop: `1px solid ${BORDER}`,
        display: "flex", padding: "10px 16px 16px",
        gap: 8, zIndex: 20,
      }}>
        {navItems.map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            flex: 1, background: view === v ? ac + "20" : "transparent",
            border: `1px solid ${view === v ? ac : BORDER}`,
            color: view === v ? ac : "#374151",
            borderRadius: 10, padding: "10px 4px", fontSize: 10,
            cursor: "pointer", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", fontFamily: "'Courier New', monospace",
          }}>{v}</button>
        ))}
      </div>
    </div>
  );
}
