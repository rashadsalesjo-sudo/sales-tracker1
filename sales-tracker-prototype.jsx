import { useState, useMemo, useCallback } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine, AreaChart, Area, ComposedChart, Legend } from "recharts";

/* ============================ SAMPLE DATA (front-end prototype) ============================ */
const MN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS = Array.from({ length: 18 }, (_, i) => { const cm = (9 + i) % 12, y = 2025 + Math.floor((9 + i) / 12); return { i, cm, y, label: `${MN[cm]} ${y}`, short: `${MN[cm].slice(0, 3)} ${String(y).slice(2)}`, days: new Date(y, cm + 1, 0).getDate() }; });
const CUR = 11, CUR_DAY = 15; // data runs Oct 2025 to 15 Sep 2026
const EL = (mi) => (mi === CUR ? CUR_DAY : mi < CUR ? MONTHS[mi].days : 0);
const weeksOf = (days) => [[1, 7], [8, 14], [15, 21], [22, days]];
const WP0 = [30, 35, 20, 15];
const ARTS = ["1001", "1002", "1003", "1004", "1005", "1006", "1007", "1008"];
const AW = [1.5, 1.3, 1.2, 1.0, 0.9, 0.8, 0.6, 0.5];
const MF = [0.76, 0.79, 0.85, 0.83, 0.81, 0.87, 0.9, 0.93, 0.91, 0.95, 0.97, 1.0];
const rng = (s) => () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
const R = rng(42);
const ZONES0 = [
  { id: "Z1", name: "Zone 1", state: "Kerala", target: 4000, f: 0.98, cf: 0.95, sl: 0.012 },
  { id: "Z2", name: "Zone 2", state: "Kerala", target: 3500, f: 0.74, cf: 0.6, sl: -0.012 },
  { id: "Z3", name: "Zone 3", state: "Karnataka", target: 3000, f: 0.94, cf: 0.85, sl: 0.005 },
  { id: "Z4", name: "Zone 4", state: "Karnataka", target: 3500, f: 0.84, cf: 0.7, sl: -0.004 },
  { id: "Z5", name: "Zone 5", state: "Tamil Nadu", target: 3000, f: 0.96, cf: 0.9, sl: 0.01 },
  { id: "Z6", name: "Zone 6", state: "Tamil Nadu", target: 3000, f: 0.78, cf: 0.65, sl: -0.008 },
];
const EX = [["Arun Menon", "Joseph K"], ["Bindu Thomas", "Reshma P"], ["Ravi Shankar", "Nikhil S"], ["Meera Nair", "Asha V"], ["Karthik Rao", "Deepak M"], ["Divya Hegde", "Sana F"], ["Suresh Iyer", "Gopal R"], ["Lakshmi Pillai", "Tara B"], ["Faisal Khan", "Imran A"], ["Anita George", "Blessy T"], ["Vijay Kumar", "Harish N"], ["Priya Raman", "Kavya L"]];
const P1 = ["Sree", "Royal", "Metro", "Star", "Prime", "Global"], P2 = ["Traders", "Agencies", "Distributors", "Enterprises", "Sales", "Mart", "Stores", "Supplies", "Wholesale", "Hub"];
const NOBILL = [3, 14, 22, 27, 38, 45, 51], DECL = [1, 8, 17, 25, 33, 41, 48, 56], GROW = [0, 5, 10, 20, 30, 40, 50], IRR = [12, 34];
const rs = (a, x, y) => { let s = 0; for (let i = Math.max(1, x); i <= y; i++) s += a[i] || 0; return s; };
const DEALERS0 = [], TSD = [], ARTD = [];
for (let m = 0; m <= CUR; m++) { TSD[m] = {}; ARTD[m] = {}; }
ZONES0.forEach((z, zi) => {
  const ws = Array.from({ length: 10 }, () => 0.6 + R() * 0.9), tw = ws.reduce((a, b) => a + b, 0);
  ws.forEach((w, k) => {
    const i = zi * 10 + k, id = "D" + String(i + 1).padStart(3, "0"), share = w / tw;
    DEALERS0.push({ id, name: `${P1[zi]} ${P2[k]}`, zoneId: z.id, exec: EX[Math.floor(i / 5)][0], ae: EX[Math.floor(i / 5)][1], share, status: "Active" });
    for (let mi = 0; mi <= CUR; mi++) {
      const days = MONTHS[mi].days, el = EL(mi), wk = weeksOf(days), T = z.target * share * MF[mi];
      const cases = Array(32).fill(0), value = [...cases], coll = [...cases], art = Object.fromEntries(ARTS.map((a) => [a, [...cases]]));
      const fz = Math.min(1.25, Math.max(0.4, z.f + z.sl * (mi - 11)));
      let dm = 1; if (DECL.includes(i)) dm = 1 + 0.05 * (11 - mi); if (GROW.includes(i)) dm = 1 - 0.03 * (11 - mi);
      if (i === 59 && mi < 9) dm = 0; if (i === 57 && mi >= 9) dm = 0; if (IRR.includes(i) && mi % 3 === 0) dm = 0;
      for (let t = 1; t <= el; t++) {
        const w = wk.findIndex(([a, b]) => t >= a && t <= b), len = wk[w][1] - wk[w][0] + 1;
        let m = fz * (0.65 + R() * 0.7) * dm * (mi === CUR && z.sl > 0 ? 1.14 : 1);
        if (mi === CUR && DECL.includes(i) && t > 7) m *= Math.max(0.2, 1 - 0.1 * (t - 7));
        const c = mi === CUR && NOBILL.includes(i) && t >= 9 ? 0 : Math.round(T * WP0[w] / 100 / len * m);
        cases[t] = c; value[t] = Math.round(c * (950 + R() * 200) * (0.92 + 0.008 * mi)); coll[t] = Math.round(value[t] * z.cf * (0.7 + R() * 0.6));
        if (c > 0) {
          const sh = ARTS.map((_, j) => AW[j] * (j === 0 && mi === CUR ? Math.max(0.15, 1 - 0.06 * (t - 1)) : 1) * (j === 2 ? 1.4 - 0.04 * mi : 1) * (j === 4 ? 0.6 + 0.05 * mi : 1) * (j === 5 && mi === 9 ? 2.2 : 1) * (0.7 + R() * 0.6)), st = sh.reduce((a, b) => a + b, 0);
          let used = 0; ARTS.forEach((a, j) => { const v = Math.floor(c * sh[j] / st); art[a][t] = v; used += v; }); art["1002"][t] += c - used;
        }
      }
      TSD[mi][id] = { cases, value, coll }; ARTD[mi][id] = art;
    }
  });
});
const Z0 = { cases: Array(32).fill(0), value: Array(32).fill(0), coll: Array(32).fill(0) };
const ts = (mi, id) => (TSD[mi] && TSD[mi][id]) || Z0, artOf = (mi, id) => (ARTD[mi] && ARTD[mi][id]) || {};
/* targets: independent entries keyed "monthIndex|type|entity" */
function seedTargets() {
  const S = {}, Cc = {};
  for (let mi = 0; mi <= CUR; mi++) {
    const ex = {}, ae = {}, exc = {}, aec = {}; let tot = 0, ctot = 0;
    ZONES0.forEach((z) => { const zt = Math.round(z.target * MF[mi]), zc = Math.round(z.target * 1000 * MF[mi] / 1000) * 1000; S[`${mi}|zone|${z.name}`] = { v: zt, on: true }; Cc[`${mi}|zone|${z.name}`] = { v: zc, on: true }; tot += zt; ctot += zc; });
    DEALERS0.forEach((d) => { const z = ZONES0.find((x) => x.id === d.zoneId), dt = Math.round(z.target * d.share * MF[mi]), dc = Math.round(z.target * 1000 * d.share * MF[mi] / 1000) * 1000; S[`${mi}|dealer|${d.name}`] = { v: dt, on: true }; Cc[`${mi}|dealer|${d.name}`] = { v: dc, on: true }; ex[d.exec] = (ex[d.exec] || 0) + dt; ae[d.ae] = (ae[d.ae] || 0) + dt; exc[d.exec] = (exc[d.exec] || 0) + dc; aec[d.ae] = (aec[d.ae] || 0) + dc; });
    Object.keys(ex).forEach((k) => { S[`${mi}|exec|${k}`] = { v: ex[k], on: true }; Cc[`${mi}|exec|${k}`] = { v: exc[k], on: true }; });
    Object.keys(ae).forEach((k) => { S[`${mi}|ae|${k}`] = { v: ae[k], on: true }; Cc[`${mi}|ae|${k}`] = { v: aec[k], on: true }; });
    S[`${mi}|company|Company`] = { v: tot, on: true }; Cc[`${mi}|company|Company`] = { v: ctot, on: true };
  }
  return { sales: S, coll: Cc };
}

/* ============================ LOGIC ============================ */
const gr = (c, p) => (p > 0 ? (c - p) / p * 100 : null);
const expPct = (t, wp, days) => { let s = 0; weeksOf(days).forEach(([a, b], i) => { if (t >= b) s += wp[i]; else if (t >= a) s += wp[i] * (t - a + 1) / (b - a + 1); }); return s; };
const dayPct = (t, wp, days) => { const w = weeksOf(days), i = w.findIndex(([a, b]) => t >= a && t <= b); return wp[Math.max(0, i)] / (w[Math.max(0, i)][1] - w[Math.max(0, i)][0] + 1); };
const stat = (pace, th) => (pace >= -th.warn ? "green" : pace >= -th.crit ? "amber" : "red");
const dstat = (ach, th) => (ach >= th.dg ? "green" : ach >= th.dr ? "amber" : "red");
const gstat = (g, th) => (g == null ? "amber" : g > th.stable ? "green" : g < -th.stable ? "red" : "amber");
function calc(list, o) {
  const mi = o.mi, days = MONTHS[mi].days, el = EL(mi), a = o.a ?? 1, b = o.b ?? el;
  let cases = 0, value = 0, coll = 0, ts0 = 0, cs0 = 0, prev = 0, prevValue = 0, prevColl = 0;
  for (const d of list) { const t = ts(mi, d.id); cases += rs(t.cases, a, b); value += rs(t.value, a, b); coll += rs(t.coll, a, b); ts0 += d.target || 0; cs0 += d.ctarget || 0; if (mi > 0) { const p = ts(mi - 1, d.id); prev += rs(p.cases, 1, el); prevValue += rs(p.value, 1, el); prevColl += rs(p.coll, 1, el); } }
  const target = o.target ?? ts0, ctarget = o.ctarget ?? cs0, tgt = target * (o.factor ?? 1), ach = tgt ? cases / tgt * 100 : 0, exp = o.exp ?? expPct(el, o.wp, days), pace = ach - exp;
  const cAch = ctarget ? coll / ctarget * 100 : 0, cExp = el / days * 100;
  return { cases, value, coll, target, ctarget, tgt, ach, exp, pace, st: o.daily ? dstat(ach, o.th) : stat(pace, o.th), gap: tgt - cases, prev, prevValue, prevColl, growth: gr(cases, prev), valGrowth: gr(value, prevValue), cAch, cExp, cSt: stat(cAch - cExp, o.th), cGap: ctarget - coll, collGrowth: gr(coll, prevColl), n: list.length };
}
const groupBy = (list, key) => { const m = new Map(); list.forEach((d) => { const k = d[key]; if (!m.has(k)) m.set(k, []); m.get(k).push(d); }); return [...m.entries()]; };
const LT = { zone: "zone", exec: "exec", ae: "ae", name: "dealer" };
const artCases = (list, mi, x, y) => ARTS.map((a) => list.reduce((s, d) => s + rs(artOf(mi, d.id)[a] || [], x, y), 0));
function artStats(list, mi) {
  const el = EL(mi), c = artCases(list, mi, 1, el), l = artCases(list, mi, el - 6, el), p = artCases(list, mi, el - 13, el - 7), pm = mi > 0 ? artCases(list, mi - 1, 1, el) : ARTS.map(() => 0), tot = c.reduce((a, b) => a + b, 0);
  return ARTS.map((a, i) => ({ a, cases: c[i], l7: l[i], p7: p[i], trend: p[i] ? (l[i] / p[i] - 1) * 100 : 0, growth: gr(c[i], pm[i]), contrib: tot ? c[i] / tot * 100 : 0 }));
}
const l7 = (d, mi) => { const el = EL(mi); return rs(ts(mi, d.id).cases, el - 6, el); }, p7 = (d, mi) => { const el = EL(mi); return rs(ts(mi, d.id).cases, el - 13, el - 7); };
function buildAlerts(list, C, G, th, mi) {
  const out = [], tot = C(list, {});
  G(list, "zone").forEach((z) => {
    if (z.st === "red") out.push({ sev: "red", t: `${z.key} is ${Math.abs(z.pace).toFixed(1)} pts below expected pace`, d: `Achieved ${P(z.ach)} vs expected ${P(z.exp)}`, to: "zones" });
    else if (z.st === "amber") out.push({ sev: "amber", t: `${z.key} is below expected pace`, d: `Achieved ${P(z.ach)} vs expected ${P(z.exp)}`, to: "zones" });
    else if (z.pace >= -1) out.push({ sev: "green", t: `${z.key} is performing strongly`, d: `${P(z.ach)} achieved, pace gap ${z.pace.toFixed(1)} pts`, to: "zones" });
  });
  G(list, "exec").forEach((e) => {
    if (e.st === "red") out.push({ sev: "red", t: `${e.key} is significantly behind target`, d: `${P(e.ach)} vs expected ${P(e.exp)}`, to: "executives" });
    else if (e.st === "amber") out.push({ sev: "amber", t: `${e.key} is approaching a target gap`, d: `${P(e.ach)} vs expected ${P(e.exp)}`, to: "executives" });
  });
  const nb = list.filter((d) => l7(d, mi) === 0), red = list.filter((d) => l7(d, mi) > 0 && p7(d, mi) > 0 && (l7(d, mi) / p7(d, mi) - 1) * 100 < -th.drop);
  if (nb.length) out.push({ sev: "red", t: `${nb.length} dealers have no billing`, d: "No cases in the last 7 days", to: "dealers" });
  if (red.length) out.push({ sev: "amber", t: `${red.length} dealers reduced billing by more than ${th.drop}%`, d: "Last 7 days vs previous 7 days", to: "dealers" });
  if (tot.cSt !== "green") out.push({ sev: tot.cSt, t: tot.cSt === "red" ? "Collection is significantly below monthly pace" : "Collection is below monthly pace", d: `${P(tot.cAch)} collected vs ${P(tot.cExp)} expected`, to: "collection" });
  G(list, "zone").forEach((z) => { if (z.cSt === "red") out.push({ sev: "red", t: `${z.key} collection is low`, d: `${P(z.cAch)} collected vs ${P(z.cExp)} expected`, to: "collection" }); });
  artStats(list, mi).forEach((a) => {
    if (a.trend < -th.decl) out.push({ sev: "red", t: `Article ${a.a} declined ${Math.abs(a.trend).toFixed(0)}% this week`, d: `${N(a.l7)} cases vs ${N(a.p7)} in the previous 7 days`, to: "articles" });
    else if (a.trend < -th.decl / 2) out.push({ sev: "amber", t: `Article ${a.a} is slowing`, d: `${a.trend.toFixed(0)}% vs previous 7 days`, to: "articles" });
  });
  const top = [...list].sort((a, b) => C([b], {}).ach - C([a], {}).ach)[0];
  if (top) out.push({ sev: "green", t: `${top.name} is the strongest dealer`, d: `${P(C([top], {}).ach)} of monthly target achieved`, to: "dealers" });
  const o = { red: 0, amber: 1, green: 2 }; return out.sort((a, b) => o[a.sev] - o[b.sev]);
}
/* month-comparison helpers */
const sumM = (list, m, fld, up) => { let s = 0; const u = up ?? EL(m); for (const d of list) s += rs(ts(m, d.id)[fld], 1, u); return s; };
const fyStart = (mi) => mi - ((MONTHS[mi].cm - 3 + 12) % 12);
const seq = (a, b) => { const o = []; for (let i = a; i <= b; i++) if (i >= 0 && i < MONTHS.length) o.push(i); return o; };
const rangeMonths = (p, mi, from, to) => (p === "l3" ? seq(mi - 2, mi) : p === "l6" ? seq(mi - 5, mi) : p === "l12" ? seq(mi - 11, mi) : p === "fy" ? seq(fyStart(mi), fyStart(mi) + 11) : seq(from, to));

/* ============================ HELPERS / UI ============================ */
const N = (v) => Math.round(v).toLocaleString("en-IN");
const P = (v) => (Math.round(v * 10) / 10).toFixed(1) + "%";
const INR = (v) => { const a = Math.abs(v), s = v < 0 ? "-" : ""; return a >= 1e7 ? `${s}₹${(a / 1e7).toFixed(2)} Cr` : a >= 1e5 ? `${s}₹${(a / 1e5).toFixed(2)} L` : `${s}₹${N(a)}`; };
const GAP = (g) => (g > 0 ? "-" + N(g) : "+" + N(-g));
const COL = { green: "#1E8E5A", amber: "#C98A0B", red: "#C93B3B" };
const PAL = ["#0E4B5A", "#C98A0B", "#7B5EA7", "#C93B3B", "#2B8A9E", "#6B8E23"];
const LB = { month: { green: "On Track", amber: "Attention", red: "Critical" }, week: { green: "On Track", amber: "At Risk", red: "Behind Target" }, coll: { green: "Good Collection", amber: "Attention Required", red: "Low Collection" } };
const Badge = ({ s, set = "month" }) => <span className="badge" style={{ color: COL[s], background: COL[s] + "1A" }}><i style={{ background: COL[s] }} />{LB[set][s]}</span>;
const Tr = ({ v }) => (v == null ? <span className="mu">—</span> : <span style={{ color: v >= 0 ? COL.green : COL.red, fontWeight: 600 }}>{v >= 0 ? "▲" : "▼"} {Math.abs(v).toFixed(1)}%</span>);
const GC = ({ g, th, tag }) => { if (tag === "new") return <span className="badge" style={{ color: COL.green, background: COL.green + "1A" }}><i style={{ background: COL.green }} />New</span>; if (g == null) return <span className="mu">—</span>; const s = gstat(g, th); return <span style={{ color: COL[s], fontWeight: 600, whiteSpace: "nowrap" }}><i className="gd" style={{ background: COL[s] }} />{g > 0 ? "+" : ""}{g.toFixed(1)}% {g > th.stable ? "↑" : g < -th.stable ? "↓" : "→"} <em className="gl">{s === "green" ? "Growth" : s === "red" ? "Decline" : "Stable"}</em></span>; };
const Prog = ({ ach, exp, st }) => <div className="prog"><i style={{ width: Math.min(ach, 100) + "%", background: COL[st] }} />{exp != null && <b style={{ left: Math.min(exp, 100) + "%" }} title={`Expected ${P(exp)}`} />}</div>;
const Kpi = ({ l, v, sub, tone }) => <div className="kpi"><div className="kl">{l}</div><div className="kv" style={tone ? { color: COL[tone] } : null}>{v}</div>{sub && <div className="ks">{sub}</div>}</div>;
const Panel = ({ title, right, children, cls = "" }) => <section className={"panel " + cls}>{(title || right) && <header><h3>{title}</h3><div>{right}</div></header>}{children}</section>;
const Tabs = ({ tabs, v, set }) => <div className="tabs">{tabs.map(([k, l, dis]) => <button key={k} disabled={dis} className={v === k ? "on" : ""} onClick={() => set(k)}>{l}</button>)}</div>;
const dl = (name, rows) => { const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n"); const u = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); const a = document.createElement("a"); a.href = u; a.download = name; a.click(); URL.revokeObjectURL(u); };
function Tbl({ cols, rows, size = 10, onRow, defSort }) {
  const [sk, setSk] = useState(defSort ? defSort.k : null), [sd, setSd] = useState(defSort ? defSort.d : -1), [pg, setPg] = useState(0);
  const sorted = useMemo(() => { if (!sk) return rows; const c = cols.find((c) => c.k === sk); if (!c) return rows; const v = c.v || ((r) => r[sk]); return [...rows].sort((a, b) => { const x = v(a) ?? -1e12, y = v(b) ?? -1e12; return (typeof x === "string" ? x.localeCompare(y) : x - y) * sd; }); }, [rows, sk, sd, cols]);
  const pages = Math.max(1, Math.ceil(sorted.length / size)), p = Math.min(pg, pages - 1);
  return <div><div className="tw"><table><thead><tr>{cols.map((c) => <th key={c.k} className={c.num ? "n" : ""} onClick={() => { if (c.nosort) return; if (sk === c.k) setSd(-sd); else { setSk(c.k); setSd(-1); } }} style={c.nosort ? { cursor: "default" } : null}>{c.l}{sk === c.k ? (sd > 0 ? " ↑" : " ↓") : ""}</th>)}</tr></thead>
    <tbody>{sorted.slice(p * size, p * size + size).map((r, i) => <tr key={i} className={onRow ? "click" : ""} onClick={onRow ? () => onRow(r) : undefined}>{cols.map((c) => <td key={c.k} className={c.num ? "n" : ""}>{c.r ? c.r(r) : r[c.k]}</td>)}</tr>)}
      {!rows.length && <tr><td colSpan={cols.length} className="empty">No records match the current filters.</td></tr>}</tbody></table></div>
    {pages > 1 && <div className="pager"><button disabled={p === 0} onClick={() => setPg(p - 1)}>Previous</button><span>Page {p + 1} of {pages}</span><button disabled={p >= pages - 1} onClick={() => setPg(p + 1)}>Next</button></div>}</div>;
}
const perfCols = (set = "month", first = "Name") => [
  { k: "key", l: first, r: (r) => <b>{r.key}</b> }, { k: "target", l: "Target", num: 1, r: (r) => N(r.target) }, { k: "cases", l: "Actual", num: 1, r: (r) => N(r.cases) },
  { k: "ach", l: "Achievement", num: 1, r: (r) => <div className="ach"><span>{P(r.ach)}</span><Prog ach={r.ach} exp={r.exp} st={r.st} /></div> },
  { k: "exp", l: "Expected", num: 1, r: (r) => P(r.exp) }, { k: "gap", l: "Gap", num: 1, r: (r) => GAP(r.gap) }, { k: "growth", l: "Growth", num: 1, r: (r) => <Tr v={r.growth} /> },
  { k: "st", l: "Status", v: (r) => ({ green: 2, amber: 1, red: 0 }[r.st]), r: (r) => <Badge s={r.st} set={set} /> },
];
const tip = { contentStyle: { borderRadius: 8, border: "1px solid #D9DFE3", fontSize: 12 }, formatter: (v) => (typeof v === "number" ? N(v) : v) };
const ax = { tick: { fontSize: 11, fill: "#5B6B73" }, axisLine: false, tickLine: false };

/* ============================ DASHBOARD PAGES ============================ */
function Overview({ X }) {
  const { tot, zoneRows, list, alerts, C, go, mi } = X, top = [...list].map((d) => ({ d, ...C([d], {}) })).sort((a, b) => b.ach - a.ach).slice(0, 5), att = alerts.filter((a) => a.sev !== "green").slice(0, 6);
  return <div className="stack">
    <section className="hero">
      <div className="hl"><div className="kl">Monthly sales · {MONTHS[mi].label}</div><div className="hv">{N(tot.cases)} <small>of {N(tot.target)} cases</small></div>
        <div className="hprog"><Prog ach={tot.ach} exp={tot.exp} st={tot.st} /><div className="hleg"><span>Achieved {P(tot.ach)}</span><span>Expected pace {P(tot.exp)}</span></div></div></div>
      <div className="hgrid"><Kpi l="Target gap" v={GAP(tot.gap)} /><Kpi l="Pace vs expected" v={(tot.pace >= 0 ? "+" : "") + tot.pace.toFixed(1) + " pts"} tone={tot.st} /><Kpi l="Sales value" v={INR(tot.value)} /><div className="kpi"><div className="kl">Status</div><div style={{ marginTop: 6 }}><Badge s={tot.st} /></div></div></div>
    </section>
    <div className="g2">
      <Panel title="Zone performance" right={<button className="link" onClick={() => go("zones")}>All zones</button>}>
        {zoneRows.map((z) => <div className="zr" key={z.key} onClick={() => go("zones")}><span className="zn">{z.key}</span><Prog ach={z.ach} exp={z.exp} st={z.st} /><span className="zp">{P(z.ach)}</span><Badge s={z.st} /></div>)}</Panel>
      <div className="stack">
        <Panel title="Top dealers" right={<button className="link" onClick={() => go("dealers")}>All dealers</button>}>{top.map((r, i) => <div className="li" key={r.d.id}><span className="rk">{i + 1}</span><span className="lt">{r.d.name}<em>{r.d.zone}</em></span><b>{P(r.ach)}</b></div>)}</Panel>
        <Panel title="Attention required">{att.map((a, i) => <div className="li click" key={i} onClick={() => go(a.to)}><span className="dot" style={{ background: COL[a.sev] }} /><span className="lt">{a.t}<em>{a.d}</em></span></div>)}{!att.length && <div className="empty">Nothing needs attention right now.</div>}</Panel>
      </div></div></div>;
}

function Daily({ X }) {
  const { list, C, G, weekPct, mi, el, days } = X, [t, setT] = useState(el);
  const o = (d) => ({ a: d, b: d, factor: dayPct(d, weekPct, days) / 100, exp: 100, daily: true });
  const cur = C(list, o(t)), y = t > 1 ? C(list, { a: t - 1, b: t - 1 }) : null, mtd = C(list, { a: 1, b: t, exp: expPct(t, weekPct, days) });
  const series = Array.from({ length: t }, (_, i) => { const d = i + 1, c = C(list, { a: d, b: d }); return { d, Cases: c.cases, Target: Math.round(c.target * dayPct(d, weekPct, days) / 100) }; });
  const zr = G(list, "zone", o(t)), er = G(list, "exec", o(t)), dl2 = list.map((d) => ({ d, ...C([d], { a: t, b: t }) })).sort((a, b) => b.cases - a.cases);
  const ac = artCases(list, mi, t, t), ar = ARTS.map((a, i) => ({ a, c: ac[i] })).sort((a, b) => b.c - a.c), crit = zr.filter((z) => z.st === "red").length;
  return <div className="stack">
    <div className="row"><label>Date <select value={t} onChange={(e) => setT(+e.target.value)}>{Array.from({ length: el }, (_, i) => el - i).map((d) => <option key={d} value={d}>{d} {MONTHS[mi].label}</option>)}</select></label><span className="note">{crit ? `${crit} zone${crit > 1 ? "s" : ""} below ${X.th.dr}% of the day's target` : "No zones critical for this day"}</span></div>
    <div className="g4"><Kpi l="Today's cases" v={N(cur.cases)} /><Kpi l="Today's sales value" v={INR(cur.value)} /><Kpi l="Today's target" v={N(cur.tgt)} /><Kpi l="Achievement" v={P(cur.ach)} tone={cur.st} sub={LB.month[cur.st]} /><Kpi l="Target gap" v={GAP(cur.gap)} />
      <Kpi l="Yesterday vs today" v={y && y.cases ? <Tr v={(cur.cases / y.cases - 1) * 100} /> : "—"} sub={y ? `${N(y.cases)} yesterday` : ""} /><Kpi l="Month-to-date cases" v={N(mtd.cases)} /><Kpi l="Month-to-date achievement" v={P(mtd.ach)} tone={mtd.st} sub={`Expected ${P(mtd.exp)}`} /></div>
    <div className="g2">
      <Panel title="Daily sales trend"><ResponsiveContainer width="100%" height={240}><ComposedChart data={series}><CartesianGrid stroke="#E7ECEF" vertical={false} /><XAxis dataKey="d" {...ax} /><YAxis {...ax} width={44} /><Tooltip {...tip} /><Bar dataKey="Cases" fill="#0E4B5A" radius={[3, 3, 0, 0]} /><Line dataKey="Target" stroke="#C98A0B" strokeDasharray="4 3" dot={false} strokeWidth={2} /></ComposedChart></ResponsiveContainer></Panel>
      <Panel title="Zone-wise achievement (day target = 100%)"><ResponsiveContainer width="100%" height={240}><BarChart data={zr.map((z) => ({ n: z.key, a: Math.round(z.ach) }))} layout="vertical"><CartesianGrid stroke="#E7ECEF" horizontal={false} /><XAxis type="number" {...ax} /><YAxis type="category" dataKey="n" {...ax} width={56} /><Tooltip {...tip} /><ReferenceLine x={100} stroke="#10222B" strokeDasharray="3 3" /><Bar dataKey="a" radius={[0, 3, 3, 0]}>{zr.map((z, i) => <Cell key={i} fill={COL[z.st]} />)}</Bar></BarChart></ResponsiveContainer></Panel></div>
    <Panel title="Executive-wise performance"><Tbl size={6} cols={[{ k: "key", l: "Executive", r: (r) => <b>{r.key}</b> }, { k: "cases", l: "Cases", num: 1, r: (r) => N(r.cases) }, { k: "tgt", l: "Day target", num: 1, r: (r) => N(r.tgt) }, { k: "ach", l: "Achievement", num: 1, r: (r) => P(r.ach) }, { k: "st", l: "Status", r: (r) => <Badge s={r.st} /> }]} rows={er} defSort={{ k: "ach", d: 1 }} /></Panel>
    <div className="g3">
      <Panel title="Top dealers"><ol className="ol">{dl2.slice(0, 5).map((r) => <li key={r.d.id}>{r.d.name}<b>{N(r.cases)}</b></li>)}</ol></Panel>
      <Panel title="Bottom dealers"><ol className="ol">{dl2.slice(-5).reverse().map((r) => <li key={r.d.id}>{r.d.name}<b>{N(r.cases)}</b></li>)}</ol></Panel>
      <Panel title="Top / bottom articles"><ol className="ol">{ar.slice(0, 3).map((r) => <li key={r.a}>Article {r.a}<b>{N(r.c)}</b></li>)}<li className="sep" />{ar.slice(-2).map((r) => <li key={r.a}>Article {r.a}<b>{N(r.c)}</b></li>)}</ol></Panel></div></div>;
}

function Weekly({ X }) {
  const { list, C, weekPct, mi, el, days } = X, weeks = weeksOf(days), cw = Math.max(0, weeks.findIndex(([a, b]) => el >= a && el <= b)), [w, setW] = useState(cw), [tab, setTab] = useState("zone");
  const [a, b] = weeks[w], eb = Math.min(b, el), ne = eb - a + 1, len = b - a + 1, factor = weekPct[w] / 100, exp = ne / len * 100, o = { a, b: eb, factor, exp }, cur = C(list, o);
  const pw = w > 0 ? [weeks[w - 1][0], weeks[w - 1][0] + ne - 1] : null, prevAll = pw ? C(list, { a: pw[0], b: pw[1] }) : null;
  const dser = Array.from({ length: len }, (_, i) => { const d = a + i; return { d: `${d}`, Actual: d <= el ? C(list, { a: d, b: d }).cases : null, Target: Math.round(cur.target * dayPct(d, weekPct, days) / 100) }; });
  const rowsFor = (key) => groupBy(list, key).map(([k, l]) => { const c = C(l, { ...o, target: X.TG("sales", LT[key], k) }), p = pw ? C(l, { a: pw[0], b: pw[1] }) : null; return { key: k, ...c, trend: p && p.cases ? (c.cases / p.cases - 1) * 100 : 0 }; });
  const cols = [{ k: "key", l: "Name", r: (r) => <b>{r.key}</b> }, { k: "tgt", l: "Weekly target", num: 1, r: (r) => N(r.tgt) }, { k: "cases", l: "Actual", num: 1, r: (r) => N(r.cases) }, { k: "ach", l: "Achievement", num: 1, r: (r) => <div className="ach"><span>{P(r.ach)}</span><Prog ach={r.ach} exp={r.exp} st={r.st} /></div> }, { k: "gap", l: "Gap", num: 1, r: (r) => GAP(r.gap) }, { k: "trend", l: "Trend", num: 1, r: (r) => <Tr v={r.trend} /> }, { k: "st", l: "Status", v: (r) => ({ green: 2, amber: 1, red: 0 }[r.st]), r: (r) => <Badge s={r.st} set="week" /> }];
  const ac = artCases(list, mi, a, eb), ap = pw ? artCases(list, mi, pw[0], pw[1]) : ARTS.map(() => 0), arows = ARTS.map((x, i) => ({ key: x, cases: ac[i], prev: ap[i], trend: ap[i] ? (ac[i] / ap[i] - 1) * 100 : 0 }));
  return <div className="stack">
    <div className="row"><label>Week <select value={w} onChange={(e) => setW(+e.target.value)}>{weeks.map(([x, y], i) => i <= cw && <option key={i} value={i}>Week {i + 1} (days {x}–{y})</option>)}</select></label>{ne < len && <span className="note">{ne} of {len} days elapsed, so expected pace is {P(exp)}</span>}</div>
    <div className="g4"><Kpi l="Weekly target" v={N(cur.tgt)} sub={`${weekPct[w]}% of monthly target`} /><Kpi l="Weekly actual" v={N(cur.cases)} /><Kpi l="Achievement" v={P(cur.ach)} tone={cur.st} sub={`Expected ${P(exp)}`} /><Kpi l="Weekly gap" v={GAP(cur.gap)} />
      <Kpi l="Vs previous week" v={prevAll && prevAll.cases ? <Tr v={(cur.cases / prevAll.cases - 1) * 100} /> : "—"} sub={prevAll ? `${N(prevAll.cases)} in same days` : "No earlier week"} /></div>
    <Panel title="Daily performance within the week"><ResponsiveContainer width="100%" height={220}><ComposedChart data={dser}><CartesianGrid stroke="#E7ECEF" vertical={false} /><XAxis dataKey="d" {...ax} /><YAxis {...ax} width={44} /><Tooltip {...tip} /><Bar dataKey="Actual" fill="#0E4B5A" radius={[3, 3, 0, 0]} /><Line dataKey="Target" stroke="#C98A0B" strokeDasharray="4 3" dot={false} strokeWidth={2} /></ComposedChart></ResponsiveContainer></Panel>
    <Panel title="Performance breakdown" right={<Tabs v={tab} set={setTab} tabs={[["zone", "Zone"], ["exec", "Executive"], ["name", "Dealer"], ["art", "Article"]]} />}>
      {tab === "art" ? <Tbl cols={[{ k: "key", l: "Article", r: (r) => <b>Article {r.key}</b> }, { k: "cases", l: "This week", num: 1, r: (r) => N(r.cases) }, { k: "prev", l: "Previous week", num: 1, r: (r) => N(r.prev) }, { k: "trend", l: "Trend", num: 1, r: (r) => <Tr v={r.trend} /> }]} rows={arows} defSort={{ k: "cases", d: -1 }} /> : <Tbl key={tab} cols={cols} rows={rowsFor(tab)} defSort={{ k: "ach", d: -1 }} />}</Panel></div>;
}

const LV = [["state", "State"], ["zone", "Zone"], ["exec", "Executive"], ["name", "Dealer"]];
function Drill({ X }) {
  const { list, G, mi } = X, [path, setPath] = useState([]);
  let sub = list; path.forEach((v, i) => { if (i < 4) sub = sub.filter((d) => d[LV[i][0]] === v); });
  const depth = path.length;
  return <Panel title="Drill-down: click a row to go deeper" right={<span className="note">{depth < 4 ? `Showing ${LV[depth][1].toLowerCase()}s` : "Showing articles"}</span>}>
    <div className="crumbs"><button onClick={() => setPath([])}>Overall</button>{path.map((p, i) => <span key={i}> › <button onClick={() => setPath(path.slice(0, i + 1))}>{p}</button></span>)}</div>
    {depth < 4 ? <Tbl key={depth} cols={perfCols("month", LV[depth][1])} rows={G(sub, LV[depth][0])} defSort={{ k: "ach", d: -1 }} onRow={(r) => setPath([...path, r.key])} />
      : <Tbl cols={[{ k: "a", l: "Article", r: (r) => <b>Article {r.a}</b> }, { k: "cases", l: "Cases", num: 1, r: (r) => N(r.cases) }, { k: "contrib", l: "Contribution", num: 1, r: (r) => P(r.contrib) }, { k: "growth", l: "Vs previous month", num: 1, r: (r) => <Tr v={r.growth} /> }]} rows={artStats(sub, mi)} defSort={{ k: "cases", d: -1 }} />}</Panel>;
}

function Monthly({ X }) {
  const { tot, list, C, mi, el, days, TGm } = X, [cmp, setCmp] = useState("prev"), rem = tot.target - tot.cases, left = days - el, cm = cmp === "prev" ? mi - 1 : mi - 12, has = cm >= 0;
  const series = Array.from({ length: el }, (_, i) => { const d = i + 1; return { d, Current: sumM(list, mi, "cases", d) - sumM(list, mi, "cases", d - 1), Compare: has ? sumM(list, cm, "cases", d) - sumM(list, cm, "cases", d - 1) : null }; });
  const mt = seq(mi - 5, mi).map((m) => ({ m: MONTHS[m].short + (m === CUR ? " MTD" : ""), Cases: sumM(list, m, "cases"), Target: X.noFilter ? TGm("sales", m, "company", "Company") : null, i: m }));
  return <div className="stack">
    <div className="g4"><Kpi l="Monthly target" v={N(tot.target)} /><Kpi l="Actual cases" v={N(tot.cases)} /><Kpi l="Sales value" v={INR(tot.value)} /><Kpi l="Achievement" v={P(tot.ach)} tone={tot.st} sub={`Expected ${P(tot.exp)} · ${LB.month[tot.st]}`} />
      <Kpi l="Target gap" v={GAP(tot.gap)} /><Kpi l="Required remaining" v={N(Math.max(0, rem))} sub="cases to hit target" /><Kpi l="Average daily requirement" v={left > 0 ? N(Math.max(0, rem) / left) : "—"} sub={left > 0 ? `over ${left} remaining days` : "month is complete"} /><Kpi l="Vs previous month" v={<Tr v={tot.growth} />} sub={tot.prev ? `${N(tot.prev)} in same period` : "no earlier data"} /></div>
    <Drill X={X} />
    <div className="g2">
      <Panel title="Daily trend" right={<select value={cmp} onChange={(e) => setCmp(e.target.value)}><option value="prev">vs previous month</option><option value="year">vs same month last year</option></select>}>
        <ResponsiveContainer width="100%" height={230}><LineChart data={series}><CartesianGrid stroke="#E7ECEF" vertical={false} /><XAxis dataKey="d" {...ax} /><YAxis {...ax} width={44} /><Tooltip {...tip} /><Line dataKey="Current" stroke="#0E4B5A" strokeWidth={2.5} dot={false} /><Line dataKey="Compare" stroke="#9AA7AD" strokeWidth={2} strokeDasharray="4 3" dot={false} /></LineChart></ResponsiveContainer>{!has && <div className="note">No data for the comparison month yet.</div>}</Panel>
      <Panel title="Monthly trend (last 6 months)"><ResponsiveContainer width="100%" height={230}><ComposedChart data={mt}><CartesianGrid stroke="#E7ECEF" vertical={false} /><XAxis dataKey="m" {...ax} /><YAxis {...ax} width={44} /><Tooltip {...tip} /><Bar dataKey="Cases" radius={[3, 3, 0, 0]}>{mt.map((r, i) => <Cell key={i} fill={r.i === mi ? "#0E4B5A" : "#8FB2BB"} />)}</Bar><Line dataKey="Target" stroke="#C98A0B" strokeDasharray="4 3" strokeWidth={2} dot={false} /></ComposedChart></ResponsiveContainer></Panel></div></div>;
}

/* ============================ MONTH COMPARISON ============================ */
const CmpTip = ({ active, payload, label, fmt }) => { if (!active || !payload || !payload.length) return null; return <div className="ctip"><b>{label}</b>{payload.map((p) => { const r = p.payload, k = p.dataKey, g = r[k + "__g"], d = r[k + "__d"], t = r[k + "__t"]; return <div key={k} className="ctr"><span><i style={{ background: p.color }} />{k}: <b>{fmt(p.value)}</b></span>{t != null && <span>Target {fmt(t)}</span>}<span>{g == null ? "Growth —" : `Growth ${g > 0 ? "+" : ""}${g.toFixed(1)}%`}{d != null && ` · Diff ${d > 0 ? "+" : ""}${fmt(d)}`}</span></div>; })}</div>; };
function Compare({ X }) {
  const { list, mi, th, TGm, noFilter } = X;
  const [view, setView] = useState("sales"), [dim, setDim] = useState("zone"), [preset, setPreset] = useState("l6"), [from, setFrom] = useState(Math.max(0, mi - 5)), [to, setTo] = useState(mi), [metric, setMetric] = useState("cases"), [sort, setSort] = useState("total"), [sels, setSels] = useState({}), [tagF, setTagF] = useState("");
  const isC = view === "coll", art = dim === "article", mt = art ? "cases" : isC ? (metric === "cases" || metric === "value" ? "coll" : metric) : metric === "coll" ? "cases" : metric, kind = isC ? "coll" : "sales";
  const rm = rangeMonths(preset, mi, from, to), dm = rm.filter((m) => m <= CUR), lastM = dm.length ? dm[dm.length - 1] : null;
  const dk = { state: "state", zone: "zone", exec: "exec", ae: "ae", dealer: "name" }[dim];
  const rows0 = useMemo(() => (dim === "overall" ? [{ key: "Company", list, type: "company", allow: noFilter }] : art ? ARTS.map((a, i) => ({ key: a, list, ai: i, art: true })) : groupBy(list, dk).map(([k, l]) => ({ key: k, list: l, type: LT[dk], allow: true, d0: l[0] }))), [list, dim, noFilter]);
  const targetOf = (row, m) => { const e = row.type && row.allow ? TGm(kind, m, row.type, row.key) : undefined; if (e !== undefined) return e; let s = 0; row.list.forEach((d) => { s += TGm(kind, m, "dealer", d.name) || 0; }); return s; };
  const actOf = (row, m, up) => (row.art ? artCases(row.list, m, 1, up ?? EL(m))[row.ai] : sumM(row.list, m, isC ? "coll" : "cases", up));
  const cellV = (row, m, met, up) => { if (m > CUR || m < 0) return null; if (met === "target") return targetOf(row, m); if (met === "ach") { const t = targetOf(row, m); return t ? actOf(row, m, up) / t * 100 : null; } if (row.art) return actOf(row, m, up); return sumM(row.list, m, met, up); };
  const totalOf = (row) => { if (mt === "ach") { let a = 0, t = 0; dm.forEach((m) => { a += actOf(row, m); t += targetOf(row, m); }); return t ? a / t * 100 : null; } return dm.reduce((s, m) => s + (cellV(row, m, mt) || 0), 0); };
  const growthOf = (row) => { if (lastM == null || lastM < 1) return { g: null }; const c = cellV(row, lastM, mt), p = cellV(row, lastM - 1, mt, lastM === CUR ? EL(CUR) : undefined); return { g: gr(c, p), isNew: p === 0 && c > 0 }; };
  const rows = useMemo(() => rows0.map((r) => {
    const cells = rm.map((m) => cellV(r, m, mt)), total = totalOf(r), { g, isNew } = growthOf(r);
    const ser = dm.map((m) => { const v = actOf(r, m); return m === CUR ? v * MONTHS[m].days / EL(m) : v; }), n = ser.length, last = ser[n - 1], zeros = ser.filter((v) => v === 0).length;
    let tag = "Steady"; if (!n) tag = "—"; else if (last === 0) tag = "Zero billing"; else if (n > 1 && ser[n - 2] === 0) tag = "New billing"; else if (zeros > 0) tag = "Irregular"; else if (n >= 4 && ser[n - 1] > ser[n - 2] && ser[n - 2] > ser[n - 3] && ser[n - 3] > ser[n - 4]) tag = "Consistently growing"; else if (g != null && g < -th.stable) tag = "Declining"; else { let fl = 0; for (let i = 2; i < n; i++) if ((ser[i] - ser[i - 1]) * (ser[i - 1] - ser[i - 2]) < 0) fl++; if (fl >= 3) tag = "Irregular"; }
    return { ...r, cells, total, g, isNew, tag };
  }), [rows0, preset, from, to, mi, view, metric, dim, X.tg, th.stable]);
  const filtered = rows.filter((r) => dim !== "dealer" || !tagF || r.tag === tagF);
  const sorted = useMemo(() => { const f = [...filtered], gv = (r) => r.g ?? 0; if (sort === "total") return f.sort((a, b) => (b.total ?? -1e12) - (a.total ?? -1e12)); if (sort === "hg") return f.sort((a, b) => gv(b) - gv(a)); if (sort === "lg") return [...f.filter((r) => gv(r) >= 0).sort((a, b) => gv(a) - gv(b)), ...f.filter((r) => gv(r) < 0)]; return f.sort((a, b) => gv(a) - gv(b)); }, [filtered, sort]);
  const fmt = (v) => (v == null ? "—" : mt === "ach" ? P(v) : (mt === "value" || isC) ? INR(v) : N(v));
  const key0 = dim + view, selKeys = (sels[key0] || rows.slice().sort((a, b) => (b.total ?? 0) - (a.total ?? 0)).slice(0, 3).map((r) => r.key)).filter((k) => rows.some((r) => r.key === k));
  const setSel = (a) => setSels({ ...sels, [key0]: a });
  const chartData = dm.map((m) => { const row = { m: MONTHS[m].short + (m === CUR ? " MTD" : "") }; selKeys.forEach((k) => { const r = rows0.find((x) => x.key === k); if (!r) return; const v = cellV(r, m, mt), pvv = m > 0 ? cellV(r, m - 1, mt, m === CUR ? EL(CUR) : undefined) : null; row[k] = v; row[k + "__g"] = gr(v, pvv); row[k + "__d"] = pvv == null ? null : v - pvv; row[k + "__t"] = !art && (mt === "cases" || mt === "coll") ? targetOf(r, m) : null; }); return row; });
  const co = rows0.length === 1 ? rows0[0] : { key: "Company", list, type: "company", allow: noFilter, art: false };
  const overall = dm.map((m) => { const v = art ? null : cellV(co, m, mt), pvv = m > 0 ? cellV(co, m - 1, mt, m === CUR ? EL(CUR) : undefined) : null, row = { m: MONTHS[m].short + (m === CUR ? " MTD" : ""), Total: v }; row.Total__g = gr(v, pvv); row.Total__d = pvv == null ? null : v - pvv; row.Total__t = mt === "cases" || mt === "coll" ? targetOf(co, m) : null; return row; });
  /* insight summary for selected month */
  const el = EL(mi), fld = isC ? "coll" : "cases", curV = sumM(list, mi, fld), prevV = mi > 0 ? sumM(list, mi - 1, fld, el) : null, gAll = gr(curV, prevV);
  const zg = groupBy(list, "zone").map(([k, l]) => ({ k, g: gr(sumM(l, mi, fld), mi > 0 ? sumM(l, mi - 1, fld, el) : 0) })).filter((x) => x.g != null).sort((a, b) => b.g - a.g);
  const ac = artCases(list, mi, 1, el), ap = mi > 0 ? artCases(list, mi - 1, 1, el) : [], ag = ARTS.map((a, i) => ({ k: a, g: gr(ac[i], ap[i] || 0) })).filter((x) => x.g != null).sort((a, b) => b.g - a.g);
  const best = (a) => (a.length && a[0].g > 0 ? `${a[0].k} (${a[0].g > 0 ? "+" : ""}${a[0].g.toFixed(1)}%)` : "None"), worst = (a) => (a.length && a[a.length - 1].g < 0 ? `${a[a.length - 1].k} (${a[a.length - 1].g.toFixed(1)}%)` : "None declined");
  const tagCounts = {}; if (dim === "dealer") rows.forEach((r) => { tagCounts[r.tag] = (tagCounts[r.tag] || 0) + 1; });
  const metricOpts = isC ? [["coll", "Collection"], ["target", "Target"], ["ach", "Achievement %"]] : [["cases", "Cases"], ["value", "Value"], ["target", "Target"], ["ach", "Achievement %"]];
  const mcols = rm.map((m, i) => ({ k: "m" + m, l: MONTHS[m].short + (m === CUR ? " (MTD)" : ""), num: 1, v: (r) => r.cells[i], r: (r) => <span className={m > CUR ? "mu" : ""}>{fmt(r.cells[i])}</span> }));
  const ex = dim === "dealer" ? [{ k: "st", l: "State", v: (r) => r.d0.state, r: (r) => r.d0.state }, { k: "zn", l: "Zone", v: (r) => r.d0.zone, r: (r) => r.d0.zone }, { k: "ex", l: "Executive", v: (r) => r.d0.exec, r: (r) => r.d0.exec }] : [];
  const cols = [{ k: "key", l: art ? "Article" : dim === "overall" ? "Level" : dk === "name" ? "Dealer" : dim === "ae" ? "Assistant executive" : dim[0].toUpperCase() + dim.slice(1), r: (r) => <b>{art ? "Article " + r.key : r.key}</b> }, ...ex, ...mcols, { k: "total", l: mt === "ach" ? "Period total" : "Total", num: 1, r: (r) => <b>{fmt(r.total)}</b> }, { k: "g", l: "Growth %", num: 1, v: (r) => r.g, r: (r) => <GC g={r.g} th={th} tag={r.isNew ? "new" : null} /> }, ...(dim === "dealer" ? [{ k: "tag", l: "Pattern", v: (r) => r.tag }] : [])];
  const dimOpts = [["overall", "Overall"], ["state", "State"], ["zone", "Zone"], ["exec", "Executive"], ["ae", "Assistant exec"], ["dealer", "Dealer"], ["article", "Article", isC]];
  const exportCsv = () => dl("month-comparison.csv", [[cols.filter((c) => c.k !== "key").length ? "Entity" : "", ...mcols.map((c) => c.l), "Total", "Growth %"], ...sorted.map((r) => [r.key, ...r.cells.map((v) => (v == null ? "" : Math.round(v * 10) / 10)), r.total == null ? "" : Math.round(r.total * 10) / 10, r.g == null ? "" : r.g.toFixed(2)])]);
  return <div className="stack">
    <section className="insight"><div className="ih"><b>Month comparison · {MONTHS[mi].label}</b><Tabs v={view} set={(v) => { setView(v); if (v === "coll" && dim === "article") setDim("zone"); }} tabs={[["sales", "Sales"], ["coll", "Collection"]]} /></div>
      <div className="ig"><Kpi l={isC ? "Collection" : "Sales"} v={isC ? INR(curV) : `${N(curV)} cases`} sub={mi === CUR ? "month to date" : "full month"} /><Kpi l="Previous month (same period)" v={prevV == null ? "—" : isC ? INR(prevV) : `${N(prevV)} cases`} /><Kpi l="Growth" v={gAll == null ? "—" : <GC g={gAll} th={th} />} /><Kpi l="Top growth zone" v={<span className="sm">{best(zg)}</span>} /><Kpi l="Largest decline zone" v={<span className="sm">{worst(zg)}</span>} />{!isC && <Kpi l="Top growth article" v={<span className="sm">{best(ag)}</span>} />}{!isC && <Kpi l="Largest decline article" v={<span className="sm">{worst(ag)}</span>} />}</div></section>
    <Panel title="Comparison controls"><div className="row">
      <label>Compare by <select value={dim} onChange={(e) => setDim(e.target.value)}>{dimOpts.map(([k, l, dis]) => <option key={k} value={k} disabled={dis}>{l}{dis ? " (sales only)" : ""}</option>)}</select></label>
      <label>Period <select value={preset} onChange={(e) => setPreset(e.target.value)}><option value="l3">Last 3 months</option><option value="l6">Last 6 months</option><option value="l12">Last 12 months</option><option value="fy">Financial year {MONTHS[fyStart(mi)] ? "" : ""}{`FY ${MONTHS[Math.max(0, fyStart(mi))].y}–${String((MONTHS[Math.max(0, fyStart(mi))].y + 1) % 100).padStart(2, "0")}`}</option><option value="custom">Custom months</option></select></label>
      {preset === "custom" && <><label>From <select value={from} onChange={(e) => { setFrom(+e.target.value); if (+e.target.value > to) setTo(+e.target.value); }}>{seq(0, CUR).map((m) => <option key={m} value={m}>{MONTHS[m].label}</option>)}</select></label><label>To <select value={to} onChange={(e) => { setTo(+e.target.value); if (+e.target.value < from) setFrom(+e.target.value); }}>{seq(0, CUR).map((m) => <option key={m} value={m}>{MONTHS[m].label}</option>)}</select></label></>}
      {!art && <label>Measure <select value={mt} onChange={(e) => setMetric(e.target.value)}>{metricOpts.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>}
      <label>Sort <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="total">Highest sales</option><option value="hg">Highest growth</option><option value="lg">Lowest growth</option><option value="hd">Highest decline</option></select></label>
      <button className="btn ghost sm" onClick={exportCsv}>Export CSV</button></div>
      <div className="note" style={{ marginTop: 8 }}>{preset === "fy" ? "Months after the current month have no data yet. " : ""}Total covers the selected period. Achievement and growth are computed from underlying totals, never by adding percentages. {mi >= CUR || lastM === CUR ? "September is month-to-date and is compared with the same days of August." : ""}</div></Panel>
    <div className="g2">
      <Panel title={art ? "Total cases by month" : "Overall monthly trend"}><ResponsiveContainer width="100%" height={230}><ComposedChart data={art ? dm.map((m) => ({ m: MONTHS[m].short, Total: sumM(list, m, "cases"), Total__g: null })) : overall}><CartesianGrid stroke="#E7ECEF" vertical={false} /><XAxis dataKey="m" {...ax} /><YAxis {...ax} width={48} tickFormatter={(v) => (mt === "ach" ? v + "%" : isC || mt === "value" ? INR(v) : N(v))} /><Tooltip content={<CmpTip fmt={fmt} />} /><Bar dataKey="Total" fill="#0E4B5A" radius={[3, 3, 0, 0]} />{!art && (mt === "cases" || mt === "coll") && <Line dataKey="Total__t" name="Target" stroke="#C98A0B" strokeDasharray="4 3" strokeWidth={2} dot={false} />}</ComposedChart></ResponsiveContainer></Panel>
      <Panel title={`${art ? "Article" : dim === "overall" ? "Company" : dim === "ae" ? "Assistant executive" : dim[0].toUpperCase() + dim.slice(1)} trend`} right={rows.length > 1 && <select value="" onChange={(e) => e.target.value && selKeys.length < 6 && setSel([...selKeys, e.target.value])}><option value="">Add to chart</option>{rows.filter((r) => !selKeys.includes(r.key)).map((r) => <option key={r.key} value={r.key}>{r.key}</option>)}</select>}>
        <div className="chips">{selKeys.map((k, i) => <button key={k} className="chip" onClick={() => setSel(selKeys.filter((x) => x !== k))}><i style={{ background: PAL[i % 6] }} />{art ? "Article " + k : k} ×</button>)}</div>
        <ResponsiveContainer width="100%" height={200}><LineChart data={chartData}><CartesianGrid stroke="#E7ECEF" vertical={false} /><XAxis dataKey="m" {...ax} /><YAxis {...ax} width={48} tickFormatter={(v) => (mt === "ach" ? v + "%" : isC || mt === "value" ? INR(v) : N(v))} /><Tooltip content={<CmpTip fmt={fmt} />} />{selKeys.map((k, i) => <Line key={k} dataKey={k} stroke={PAL[i % 6]} strokeWidth={2.2} dot={{ r: 3 }} connectNulls />)}</LineChart></ResponsiveContainer></Panel></div>
    <Panel title={`${isC ? "Collection" : "Sales"} by month`}>
      {dim === "dealer" && <div className="chips" style={{ marginBottom: 10 }}>{["Consistently growing", "Declining", "New billing", "Zero billing", "Irregular"].map((t) => <button key={t} className={"chip" + (tagF === t ? " on" : "")} onClick={() => setTagF(tagF === t ? "" : t)}>{t} ({tagCounts[t] || 0})</button>)}{tagF && <button className="link" onClick={() => setTagF("")}>Clear</button>}</div>}
      <Tbl key={[dim, view, preset, mt, sort, tagF, from, to, mi].join()} cols={cols} rows={sorted} size={12} /></Panel></div>;
}

function Sales({ X }) {
  const { list, C, weekPct, mi, el, days } = X;
  const rows = Array.from({ length: el }, (_, i) => { const d = el - i, c = C(list, { a: d, b: d, factor: dayPct(d, weekPct, days) / 100, exp: 100, daily: true }); return { date: `${String(d).padStart(2, "0")}-${String(MONTHS[mi].cm + 1).padStart(2, "0")}-${MONTHS[mi].y}`, d, ...c }; });
  return <Panel title="Daily sales register"><Tbl cols={[{ k: "d", l: "Date", r: (r) => r.date }, { k: "cases", l: "Cases", num: 1, r: (r) => N(r.cases) }, { k: "value", l: "Value", num: 1, r: (r) => INR(r.value) }, { k: "tgt", l: "Day target", num: 1, r: (r) => N(r.tgt) }, { k: "ach", l: "Achievement", num: 1, r: (r) => P(r.ach) }, { k: "st", l: "Status", r: (r) => <Badge s={r.st} /> }]} rows={rows} defSort={{ k: "d", d: -1 }} size={15} /></Panel>;
}
function Zones({ X }) {
  const { zoneRows } = X;
  return <div className="stack"><Panel title="Achievement vs expected pace"><ResponsiveContainer width="100%" height={240}><BarChart data={zoneRows.map((z) => ({ n: z.key, Achieved: +z.ach.toFixed(1), Expected: +z.exp.toFixed(1) }))}><CartesianGrid stroke="#E7ECEF" vertical={false} /><XAxis dataKey="n" {...ax} /><YAxis {...ax} width={36} unit="%" /><Tooltip {...tip} /><Bar dataKey="Expected" fill="#D5DDE1" radius={[3, 3, 0, 0]} /><Bar dataKey="Achieved" radius={[3, 3, 0, 0]}>{zoneRows.map((z, i) => <Cell key={i} fill={COL[z.st]} />)}</Bar></BarChart></ResponsiveContainer></Panel>
    <Panel title="Zone performance"><Tbl cols={perfCols("month", "Zone")} rows={zoneRows} defSort={{ k: "ach", d: 1 }} /><div className="note">Zone targets come from Sales Target Management for the selected month.</div></Panel></div>;
}
function Execs({ X }) {
  const { list, G, mi } = X, [k, setK] = useState("exec");
  const rows = G(list, k).map((r) => { const bill = r.list.filter((d) => l7(d, mi) > 0).length; return { ...r, zone: [...new Set(r.list.map((d) => d.zone))].join(", "), active: r.list.length, bill, nobill: r.list.length - bill }; });
  return <Panel title="Sales team performance" right={<Tabs v={k} set={setK} tabs={[["exec", "Executive"], ["ae", "Assistant executive"]]} />}>
    <Tbl key={k} cols={[{ k: "key", l: k === "exec" ? "Executive" : "Assistant executive", r: (r) => <b>{r.key}</b> }, { k: "zone", l: "Zone" }, { k: "target", l: "Target", num: 1, r: (r) => N(r.target) }, { k: "cases", l: "Actual", num: 1, r: (r) => N(r.cases) }, { k: "ach", l: "Achievement", num: 1, r: (r) => <div className="ach"><span>{P(r.ach)}</span><Prog ach={r.ach} exp={r.exp} st={r.st} /></div> }, { k: "gap", l: "Gap", num: 1, r: (r) => GAP(r.gap) }, { k: "exp", l: "Expected", num: 1, r: (r) => P(r.exp) }, { k: "active", l: "Active dealers", num: 1 }, { k: "bill", l: "With billing", num: 1 }, { k: "nobill", l: "No billing", num: 1, r: (r) => <span style={r.nobill ? { color: COL.red, fontWeight: 600 } : null}>{r.nobill}</span> }, { k: "st", l: "Status", v: (r) => ({ green: 2, amber: 1, red: 0 }[r.st]), r: (r) => <Badge s={r.st} /> }]} rows={rows} defSort={{ k: "ach", d: 1 }} /></Panel>;
}
function Dealers({ X }) {
  const { list, C, th, mi } = X, [tab, setTab] = useState("all"), [q, setQ] = useState("");
  const all = list.map((d) => { const c = C([d], {}), a = l7(d, mi), b = p7(d, mi), drop = b ? (a / b - 1) * 100 : 0; return { key: d.name, d, ...c, bill: a === 0 ? "No billing" : drop < -th.drop ? "Reduced" : "Billing" }; });
  const sets = { all, top: [...all].sort((a, b) => b.ach - a.ach).slice(0, 10), low: all.filter((r) => r.st === "red" && r.bill !== "No billing"), nob: all.filter((r) => r.bill === "No billing"), dec: all.filter((r) => r.bill === "Reduced"), hi: all.filter((r) => r.cSt === "green"), lo: all.filter((r) => r.cSt === "red") };
  const names = [["all", "All"], ["top", "Top"], ["low", "Low performing"], ["nob", "No billing"], ["dec", "Declining"], ["hi", "High collection"], ["lo", "Low collection"]], rows = sets[tab].filter((r) => r.key.toLowerCase().includes(q.toLowerCase()));
  return <Panel title="Dealer analytics" right={<input className="search" placeholder="Search dealer" value={q} onChange={(e) => setQ(e.target.value)} />}>
    <Tabs v={tab} set={setTab} tabs={names.map(([k, l]) => [k, `${l} (${sets[k].length})`])} />
    <Tbl key={tab} cols={[{ k: "key", l: "Dealer", r: (r) => <b>{r.key}</b> }, { k: "state", l: "State", v: (r) => r.d.state, r: (r) => r.d.state }, { k: "zone", l: "Zone", v: (r) => r.d.zone, r: (r) => r.d.zone }, { k: "exec", l: "Executive", v: (r) => r.d.exec, r: (r) => r.d.exec }, { k: "target", l: "Target", num: 1, r: (r) => N(r.target) }, { k: "cases", l: "Cases", num: 1, r: (r) => N(r.cases) }, { k: "value", l: "Value", num: 1, r: (r) => INR(r.value) }, { k: "ach", l: "Achievement", num: 1, r: (r) => P(r.ach) }, { k: "growth", l: "Growth", num: 1, r: (r) => <Tr v={r.growth} /> }, { k: "coll", l: "Collection", num: 1, r: (r) => INR(r.coll) }, { k: "bill", l: "Billing", r: (r) => <span style={{ color: r.bill === "Billing" ? COL.green : r.bill === "Reduced" ? COL.amber : COL.red, fontWeight: 600 }}>{r.bill}</span> }]} rows={rows} defSort={{ k: "ach", d: -1 }} /></Panel>;
}
function Articles({ X }) {
  const { list, mi, el } = X, [g, setG] = useState("all"), [sel, setSel] = useState("1001"), st = artStats(list, mi), key = { zone: "zone", state: "state", dealer: "name" }[g];
  const mx = key ? groupBy(list, key).map(([k, l]) => { const c = artCases(l, mi, 1, el); return { key: k, c, tot: c.reduce((a, b) => a + b, 0) }; }) : [];
  const trend = Array.from({ length: el }, (_, i) => ({ d: i + 1, Cases: artCases(list, mi, i + 1, i + 1)[ARTS.indexOf(sel)] })), max = Math.max(1, ...mx.flatMap((r) => r.c));
  return <div className="stack">
    <div className="g2"><Panel title="Cases by article"><ResponsiveContainer width="100%" height={240}><BarChart data={st.map((s) => ({ a: s.a, Cases: s.cases }))}><CartesianGrid stroke="#E7ECEF" vertical={false} /><XAxis dataKey="a" {...ax} /><YAxis {...ax} width={44} /><Tooltip {...tip} /><Bar dataKey="Cases" fill="#0E4B5A" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></Panel>
      <Panel title="Daily trend" right={<select value={sel} onChange={(e) => setSel(e.target.value)}>{ARTS.map((a) => <option key={a} value={a}>Article {a}</option>)}</select>}><ResponsiveContainer width="100%" height={240}><AreaChart data={trend}><CartesianGrid stroke="#E7ECEF" vertical={false} /><XAxis dataKey="d" {...ax} /><YAxis {...ax} width={40} /><Tooltip {...tip} /><Area dataKey="Cases" stroke="#0E4B5A" fill="#0E4B5A22" strokeWidth={2} /></AreaChart></ResponsiveContainer></Panel></div>
    <Panel title="Article analytics" right={<Tabs v={g} set={setG} tabs={[["all", "Overall"], ["zone", "By zone"], ["state", "By state"], ["dealer", "By dealer"]]} />}>
      {g === "all" ? <Tbl cols={[{ k: "a", l: "Article", r: (r) => <b>Article {r.a}</b> }, { k: "cases", l: "Cases", num: 1, r: (r) => N(r.cases) }, { k: "contrib", l: "Contribution", num: 1, r: (r) => P(r.contrib) }, { k: "growth", l: "Growth vs prev month", num: 1, r: (r) => <Tr v={r.growth} /> }, { k: "trend", l: "7-day trend", num: 1, r: (r) => <Tr v={r.trend} /> }]} rows={st} defSort={{ k: "cases", d: -1 }} />
        : <Tbl key={g} cols={[{ k: "key", l: g === "zone" ? "Zone" : g === "state" ? "State" : "Dealer", r: (r) => <b>{r.key}</b> }, ...ARTS.map((a, i) => ({ k: "a" + a, l: a, num: 1, v: (r) => r.c[i], r: (r) => <span className="heat" style={{ background: `rgba(14,75,90,${(r.c[i] / max * 0.55).toFixed(2)})`, color: r.c[i] / max > 0.4 ? "#fff" : "inherit" }}>{N(r.c[i])}</span> })), { k: "tot", l: "Total", num: 1, r: (r) => N(r.tot) }]} rows={mx} defSort={{ k: "tot", d: -1 }} />}</Panel></div>;
}
function Collection({ X }) {
  const { tot, list, C, G, el, mi } = X, [k, setK] = useState("zone");
  const series = Array.from({ length: el }, (_, i) => ({ d: i + 1, Collected: C(list, { a: i + 1, b: i + 1 }).coll })), rows = G(list, k);
  return <div className="stack">
    <div className="g4"><Kpi l="Monthly collection target" v={INR(tot.ctarget)} /><Kpi l="Collection achieved" v={INR(tot.coll)} /><Kpi l="Achievement" v={P(tot.cAch)} tone={tot.cSt} sub={`Expected ${P(tot.cExp)} · ${LB.coll[tot.cSt]}`} /><Kpi l="Collection gap" v={INR(tot.cGap)} />
      <Kpi l="Average daily collection" v={INR(el ? tot.coll / el : 0)} /><Kpi l="Previous month" v={INR(tot.prevColl)} sub="same period" /><Kpi l="Growth" v={<Tr v={tot.collGrowth} />} /></div>
    <Panel title="Daily collection"><ResponsiveContainer width="100%" height={200}><AreaChart data={series}><CartesianGrid stroke="#E7ECEF" vertical={false} /><XAxis dataKey="d" {...ax} /><YAxis {...ax} width={56} tickFormatter={(v) => INR(v)} /><Tooltip {...tip} formatter={(v) => INR(v)} /><Area dataKey="Collected" stroke="#0E4B5A" fill="#0E4B5A22" strokeWidth={2} /></AreaChart></ResponsiveContainer></Panel>
    <Panel title="Collection breakdown" right={<Tabs v={k} set={setK} tabs={[["zone", "Zone"], ["exec", "Executive"], ["ae", "Assistant exec"], ["name", "Dealer"], ["state", "State"]]} />}>
      <Tbl key={k} cols={[{ k: "key", l: "Name", r: (r) => <b>{r.key}</b> }, { k: "ctarget", l: "Target", num: 1, r: (r) => INR(r.ctarget) }, { k: "coll", l: "Collected", num: 1, r: (r) => INR(r.coll) }, { k: "cAch", l: "Achievement", num: 1, r: (r) => <div className="ach"><span>{P(r.cAch)}</span><Prog ach={r.cAch} exp={r.cExp} st={r.cSt} /></div> }, { k: "cGap", l: "Gap", num: 1, r: (r) => INR(r.cGap) }, { k: "collGrowth", l: "Growth", num: 1, r: (r) => <Tr v={r.collGrowth} /> }, { k: "cSt", l: "Status", v: (r) => ({ green: 2, amber: 1, red: 0 }[r.cSt]), r: (r) => <Badge s={r.cSt} set="coll" /> }]} rows={rows} defSort={{ k: "cAch", d: 1 }} /></Panel></div>;
}
function Alerts({ X }) {
  const { alerts, go } = X, [f, setF] = useState("all"), n = (s) => alerts.filter((a) => a.sev === s).length, rows = alerts.filter((a) => f === "all" || a.sev === f), T = { red: "Critical", amber: "Attention", green: "On track" };
  return <Panel title="Alert Center" right={<span className="note">Thresholds are set in Admin › Settings</span>}>
    <Tabs v={f} set={setF} tabs={[["all", `All (${alerts.length})`], ["red", `Critical (${n("red")})`], ["amber", `Attention (${n("amber")})`], ["green", `On track (${n("green")})`]]} />
    {rows.map((a, i) => <div className="alert" key={i} style={{ borderLeftColor: COL[a.sev] }}><div><b>{a.t}</b><em>{a.d}</em></div><span className="badge" style={{ color: COL[a.sev], background: COL[a.sev] + "1A" }}>{T[a.sev]}</span><button className="btn sm" onClick={() => go(a.to)}>Open</button></div>)}</Panel>;
}
function Reports({ X, toast }) {
  const { list, C, G, zoneRows, mi } = X;
  const defs = [
    ["Sales data", () => [["Date", "Dealer", "Cases", "Value"], ...list.flatMap((d) => Array.from({ length: EL(mi) }, (_, i) => [`${i + 1} ${MONTHS[mi].label}`, d.name, ts(mi, d.id).cases[i + 1], ts(mi, d.id).value[i + 1]]))], "sales.csv"],
    ["Article data", () => [["Article", "Cases"], ...artStats(list, mi).map((a) => [a.a, a.cases])], "articles.csv"],
    ["Collection data", () => [["Dealer", "Collection"], ...list.map((d) => [d.name, C([d], {}).coll])], "collection.csv"],
    ["Dealer performance", () => [["Dealer", "Zone", "Cases", "Achievement %"], ...list.map((d) => { const c = C([d], {}); return [d.name, d.zone, c.cases, c.ach.toFixed(1)]; })], "dealers.csv"],
    ["Zone performance", () => [["Zone", "Target", "Actual", "Achievement %"], ...zoneRows.map((z) => [z.key, Math.round(z.target), z.cases, z.ach.toFixed(1)])], "zones.csv"],
    ["Executive performance", () => [["Executive", "Target", "Actual", "Achievement %"], ...G(list, "exec").map((z) => [z.key, Math.round(z.target), z.cases, z.ach.toFixed(1)])], "executives.csv"],
  ];
  return <Panel title={`Reports and exports · ${MONTHS[mi].label}`} right={<span className="note">Exports respect the month and filters. Month Comparison exports from its own page.</span>}>
    {defs.map(([n, f, file]) => <div className="li" key={n}><span className="lt">{n}</span><button className="btn sm" onClick={() => dl(file, f())}>CSV</button><button className="btn sm ghost" onClick={() => toast("Excel and PDF export arrive in a later phase")}>Excel</button><button className="btn sm ghost" onClick={() => toast("Excel and PDF export arrive in a later phase")}>PDF</button></div>)}</Panel>;
}

/* ============================ ADMIN ============================ */
const HIST0 = [["15-09-2026 09:12", "Sales value", "Admin", 1250, 1225, 25], ["14-09-2026 09:05", "Sales value", "Admin", 1240, 1240, 0], ["14-09-2026 09:20", "Collection", "Admin", 610, 604, 6]];
function Upload() {
  const [type, setType] = useState("Sales value"), [step, setStep] = useState(0), [hist, setHist] = useState(HIST0);
  const errs = [[12, "Sree Traderz", "Dealer not found in master data"], [48, "Metro Hub", "Invalid date 31-09-2026"], [77, "Star Mart", "Cases is not a number"], [131, "Prime Sales", "Value is missing"], [204, "Royal Stores", "Duplicate of row 203"], [389, "Global Hub", "Dealer is inactive"]];
  const heads = { "Sales value": ["Date", "Dealer", "Cases", "Value"], "Article sales": ["Date", "Article", "Dealer", "Cases"], Collection: ["Date", "Dealer", "Collection"] }[type];
  const rowsP = { "Sales value": [["15-09-2026", "Sree Traders", 120, 125000], ["15-09-2026", "Royal Agencies", 80, 82000]], "Article sales": [["15-09-2026", "1001", "Sree Traders", 40], ["15-09-2026", "1002", "Sree Traders", 25]], Collection: [["15-09-2026", "Sree Traders", 90000], ["15-09-2026", "Royal Agencies", 61000]] }[type];
  return <div className="stack">
    <Panel title="Import daily data"><div className="row"><label>Data type <select value={type} onChange={(e) => { setType(e.target.value); setStep(0); }}><option>Sales value</option><option>Article sales</option><option>Collection</option></select></label><span className="note">Expected columns: {heads.join(", ")}</span></div>
      <div className="steps">{["Upload file", "Validate and preview", "Confirm import", "Summary"].map((s, i) => <span key={s} className={i <= step ? "on" : ""}>{i + 1}. {s}</span>)}</div>
      {step === 0 && <div className="drop"><p>Drop an Excel or CSV file here</p><button className="btn" onClick={() => setStep(1)}>Use sample file</button></div>}
      {step === 1 && <div className="stack"><div className="g4"><Kpi l="Total rows" v="1,250" /><Kpi l="Valid" v="1,230" tone="green" /><Kpi l="Errors" v="20" tone="red" /><Kpi l="Duplicates" v="5" tone="amber" /></div>
        <div className="tw"><table><thead><tr>{heads.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{rowsP.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div>
        <h4>Rows with problems (6 of 25 shown)</h4><div className="tw"><table><thead><tr><th>Row</th><th>Dealer</th><th>Problem</th></tr></thead><tbody>{errs.map((e) => <tr key={e[0]}><td>{e[0]}</td><td>{e[1]}</td><td style={{ color: COL.red }}>{e[2]}</td></tr>)}</tbody></table></div>
        <div className="row"><button className="btn" onClick={() => { setHist([["15-09-2026 18:40", type, "Admin", 1250, 1225, 25], ...hist]); setStep(3); }}>Import 1,225 valid rows</button><button className="btn ghost" onClick={() => dl("import-errors.csv", [["Row", "Dealer", "Problem"], ...errs])}>Download error details</button><button className="btn ghost" onClick={() => setStep(0)}>Cancel</button></div></div>}
      {step === 3 && <div className="stack"><div className="g4"><Kpi l="Total rows" v="1,250" /><Kpi l="Valid" v="1,230" /><Kpi l="Errors / duplicates" v="20 / 5" /><Kpi l="Imported" v="1,225" tone="green" /></div><div className="note">Dashboards and alerts refresh from the single database after every import.</div><button className="btn" onClick={() => setStep(0)}>Import another file</button></div>}</Panel>
    <Panel title="Upload history"><Tbl size={5} cols={[{ k: "0", l: "When", r: (r) => r[0] }, { k: "1", l: "Type", r: (r) => r[1] }, { k: "2", l: "By", r: (r) => r[2] }, { k: "3", l: "Rows", num: 1, r: (r) => N(r[3]) }, { k: "4", l: "Imported", num: 1, r: (r) => N(r[4]) }, { k: "5", l: "Errors", num: 1, r: (r) => r[5] }]} rows={hist} /></Panel></div>;
}
function Master({ X, toast }) {
  const { all, zones, setZones, setDealers, log } = X, [pending, setPending] = useState([]), [nd, setNd] = useState({ name: "", zoneId: zones[0].id, exec: EX[0][0] }), [nz, setNz] = useState({ name: "", state: "Kerala" });
  const zn = (id) => zones.find((z) => z.id === id)?.name;
  return <div className="stack">
    <Panel title="Dealers" right={<span className="note">{all.filter((d) => d.status === "Active").length} active of {all.length}</span>}>
      <Tbl size={8} cols={[{ k: "name", l: "Dealer", r: (r) => <b>{r.name}</b> }, { k: "zone", l: "Zone (current)" }, { k: "exec", l: "Executive" }, { k: "ae", l: "Assistant" }, { k: "status", l: "Status", r: (r) => <span style={{ color: r.status === "Active" ? COL.green : COL.red, fontWeight: 600 }}>{r.status}</span> },
        { k: "mv", l: "Move from next month", nosort: 1, r: (r) => <select value="" onChange={(e) => { if (!e.target.value) return; setPending([...pending, { name: r.name, to: zn(e.target.value), from: r.zone }]); log(`Scheduled ${r.name}: ${r.zone} to ${zn(e.target.value)} from 1 Oct 2026`); toast("Move scheduled from 1 Oct 2026. Earlier months keep their zone."); }}><option value="">Choose zone</option>{zones.filter((z) => z.id !== r.zoneId).map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}</select> },
        { k: "act", l: "", nosort: 1, r: (r) => <button className="btn sm ghost" onClick={() => { setDealers((ds) => ds.map((d) => d.id === r.id ? { ...d, status: d.status === "Active" ? "Inactive" : "Active" } : d)); log(`${r.status === "Active" ? "Deactivated" : "Activated"} ${r.name}`); }}>{r.status === "Active" ? "Deactivate" : "Activate"}</button> }]} rows={all} /></Panel>
    <div className="g2">
      <Panel title="Scheduled assignment changes">{pending.length ? pending.map((p, i) => <div className="li" key={i}><span className="lt">{p.name}<em>{p.from} to {p.to}, effective 1 Oct 2026</em></span></div>) : <div className="empty">No changes scheduled. Moves take effect on the chosen date, so past months keep their original zone.</div>}</Panel>
      <div className="stack"><Panel title="Add dealer"><div className="form"><input placeholder="Dealer name" value={nd.name} onChange={(e) => setNd({ ...nd, name: e.target.value })} /><select value={nd.zoneId} onChange={(e) => setNd({ ...nd, zoneId: e.target.value })}>{zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}</select><select value={nd.exec} onChange={(e) => setNd({ ...nd, exec: e.target.value })}>{EX.map((e) => <option key={e[0]}>{e[0]}</option>)}</select>
        <button className="btn" disabled={!nd.name.trim()} onClick={() => { const e = EX.find((x) => x[0] === nd.exec); setDealers((ds) => [...ds, { id: "D" + (100 + ds.length), name: nd.name.trim(), zoneId: nd.zoneId, exec: e[0], ae: e[1], share: 0.05, status: "Active" }]); log(`Added dealer ${nd.name}`); toast("Dealer added. Set its targets in Target Management."); setNd({ ...nd, name: "" }); }}>Add dealer</button></div></Panel>
        <Panel title="Add zone"><div className="form"><input placeholder="Zone name" value={nz.name} onChange={(e) => setNz({ ...nz, name: e.target.value })} /><select value={nz.state} onChange={(e) => setNz({ ...nz, state: e.target.value })}>{[...new Set(zones.map((z) => z.state))].map((s) => <option key={s}>{s}</option>)}</select>
          <button className="btn" disabled={!nz.name.trim()} onClick={() => { setZones([...zones, { id: "Z" + (zones.length + 1), name: nz.name.trim(), state: nz.state, target: 0, f: 1, cf: 1, sl: 0 }]); log(`Added zone ${nz.name}`); toast("Zone added. Set its target in Target Management."); setNz({ ...nz, name: "" }); }}>Add zone</button></div></Panel></div></div></div>;
}
function NumIn({ v, on, step = 1 }) { return <input className="num" type="number" value={v} step={step} onChange={(e) => on(Math.max(0, +e.target.value))} />; }
const TYPES = [["company", "Overall company"], ["zone", "Zone"], ["exec", "Executive"], ["ae", "Assistant executive"], ["dealer", "Dealer"]];
function TargetMgr({ X, kind, toast }) {
  const { tg, zones, dealers, setT, delT, batch, hist, mi: gmi } = X, isC = kind === "coll", fmt = isC ? INR : N;
  const [yr, setYr] = useState(MONTHS[gmi].y), [cmo, setCmo] = useState(MONTHS[gmi].cm), [type, setType] = useState("zone"), [ent, setEnt] = useState(""), [val, setVal] = useState(""), [bulk, setBulk] = useState(null);
  const validM = MONTHS.filter((m) => m.y === yr).map((m) => m.cm), mo = validM.includes(cmo) ? cmo : validM[0], m = MONTHS.find((x) => x.y === yr && x.cm === mo).i;
  const ents = type === "company" ? ["Company"] : type === "zone" ? zones.map((z) => z.name) : type === "exec" ? EX.map((e) => e[0]) : type === "ae" ? EX.map((e) => e[1]) : dealers.map((d) => d.name);
  const T = tg[kind], get = (t, e) => T[`${m}|${t}|${e}`], rows = ents.map((e) => ({ e, x: get(type, e) })), cnt = Object.keys(T).filter((k) => k.startsWith(m + "|")).length;
  const cur = ent && ents.includes(ent) ? ent : ents[0];
  const doAdd = () => { const v = Math.round(+val); if (!v || v < 0) { toast("Enter a target above zero"); return; } setT(kind, m, type, cur, v, true, get(type, cur) ? "Updated" : "Added"); toast(`${TYPES.find((t) => t[0] === type)[1]} target saved for ${MONTHS[m].label}`); setVal(""); };
  const copyPrev = () => { if (m < 1) { toast("No earlier month to copy from"); return; } const pairs = Object.keys(T).filter((k) => k.startsWith(m - 1 + "|")).map((k) => [`${m}|${k.split("|").slice(1).join("|")}`, T[k]]); batch(kind, pairs, `Copied from ${MONTHS[m - 1].label}`, m); toast(`Copied ${pairs.length} targets from ${MONTHS[m - 1].label}`); };
  const sampleBulk = () => { const pairs = dealers.slice(0, 5).map((d) => [`${m}|dealer|${d.name}`, { v: Math.round(((get("dealer", d.name) || { v: 100 }).v) * 1.1), on: true }]); batch(kind, pairs, "Bulk upload", m); setBulk({ ok: 5, err: [["Sree Traderz", "Dealer not found in master data"]] }); };
  const exportT = () => dl(`${kind}-targets-${MONTHS[m].label.replace(" ", "-")}.csv`, [["Month", "Type", "Entity", "Target", "Status"], ...Object.keys(T).filter((k) => k.startsWith(m + "|")).map((k) => { const [, t, e] = k.split("|"); return [MONTHS[m].label, t, e, T[k].v, T[k].on ? "Active" : "Inactive"]; })]);
  const hrows = hist.filter((h) => h.kind === kind);
  return <div className="stack">
    <Panel title={`${isC ? "Collection" : "Sales"} target management`} right={<span className="note">{cnt} targets set for {MONTHS[m].label}</span>}>
      <div className="row">
        <label>Year <select value={yr} onChange={(e) => setYr(+e.target.value)}>{[2025, 2026, 2027].map((y) => <option key={y}>{y}</option>)}</select></label>
        <label>Month <select value={mo} onChange={(e) => setCmo(+e.target.value)}>{validM.map((c) => <option key={c} value={c}>{MN[c]}</option>)}</select></label>
        <label>Target type <select value={type} onChange={(e) => { setType(e.target.value); setEnt(""); }}>{TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
        <label>Entity <select value={cur} onChange={(e) => setEnt(e.target.value)}>{ents.map((e) => <option key={e}>{e}</option>)}</select></label>
        <label>Target {isC ? "(₹)" : "(cases)"} <input className="num" type="number" placeholder={get(type, cur) ? String(get(type, cur).v) : "0"} value={val} onChange={(e) => setVal(e.target.value)} /></label>
        <button className="btn" onClick={doAdd}>{get(type, cur) ? "Update target" : "Add target"}</button></div>
      <div className="note" style={{ marginTop: 8 }}>{`${yr} → ${MN[mo]} → ${TYPES.find((t) => t[0] === type)[1]} → ${cur}`}. Each target is independent: changing one never changes another.</div>
      <div className="row" style={{ marginTop: 12 }}><button className="btn ghost sm" onClick={copyPrev}>Copy previous month</button><button className="btn ghost sm" onClick={sampleBulk}>Bulk upload (sample Excel)</button><button className="btn ghost sm" onClick={() => dl(`${kind}-target-template.csv`, [["Month", "Type", "Entity", "Target"], [MONTHS[m].label, "dealer", dealers[0].name, ""]])}>Download template</button><button className="btn ghost sm" onClick={exportT}>Export targets</button></div>
      {bulk && <div className="ok">Bulk upload: {bulk.ok} rows applied, {bulk.err.length} error ({bulk.err[0][0]}: {bulk.err[0][1]}).</div>}</Panel>
    <Panel title={`${TYPES.find((t) => t[0] === type)[1]} targets · ${MONTHS[m].label}`}>
      <Tbl key={`${m}${type}${kind}`} size={10} cols={[{ k: "e", l: "Entity", r: (r) => <b>{r.e}</b> }, { k: "v", l: "Target", num: 1, v: (r) => (r.x ? r.x.v : -1), r: (r) => (r.x ? <input className="num" type="number" defaultValue={r.x.v} key={r.x.v} onBlur={(e) => { const v = Math.round(+e.target.value); if (v > 0 && v !== r.x.v) { setT(kind, m, type, r.e, v, r.x.on, "Updated"); toast("Target updated. Previous value kept in history."); } }} /> : <span className="mu">Not set (derived from dealers)</span>) },
        { k: "f", l: "Shown as", num: 1, r: (r) => (r.x ? fmt(r.x.v) : "—") }, { k: "s", l: "Status", r: (r) => (r.x ? <span style={{ color: r.x.on ? COL.green : COL.red, fontWeight: 600 }}>{r.x.on ? "Active" : "Inactive"}</span> : "—") },
        { k: "a", l: "", nosort: 1, r: (r) => (r.x ? <span className="row"><button className="btn sm ghost" onClick={() => setT(kind, m, type, r.e, r.x.v, !r.x.on, r.x.on ? "Deactivated" : "Activated")}>{r.x.on ? "Deactivate" : "Activate"}</button><button className="btn sm ghost" onClick={() => { delT(kind, m, type, r.e); toast("Target deleted"); }}>Delete</button></span> : <button className="btn sm ghost" onClick={() => { setEnt(r.e); toast("Enter a value above and press Add target"); }}>Set</button>) }]} rows={rows} /></Panel>
    <Panel title="Target history" right={<span className="note">Every change is kept, and other months are never overwritten</span>}>
      <Tbl size={6} cols={[{ k: "when", l: "When", r: (r) => r.when }, { k: "m", l: "Month", r: (r) => MONTHS[r.m].label }, { k: "type", l: "Type", r: (r) => TYPES.find((t) => t[0] === r.type)[1] }, { k: "e", l: "Entity" }, { k: "from", l: "Old", num: 1, r: (r) => (r.from == null ? "—" : fmt(r.from)) }, { k: "to", l: "New", num: 1, r: (r) => (r.to == null ? "—" : fmt(r.to)) }, { k: "act", l: "Action" }]} rows={hrows} /></Panel></div>;
}
function WeekSet({ X, toast }) {
  const { weekPct, setWeekPct, log, tot } = X, [v, setV] = useState(weekPct), sum = v.reduce((a, b) => a + b, 0), ok = sum === 100; let cum = 0;
  return <Panel title="Weekly target distribution"><div className="tw"><table><thead><tr><th>Week</th><th>Days (30-day month)</th><th className="n">Share</th><th className="n">Weekly target (selected month)</th><th className="n">Expected by week end</th></tr></thead><tbody>{weeksOf(30).map(([a, b], i) => { cum += v[i]; return <tr key={i}><td><b>Week {i + 1}</b></td><td>{a}–{b}</td><td className="n"><NumIn v={v[i]} on={(x) => setV(v.map((y, j) => j === i ? x : y))} /> %</td><td className="n">{N(tot.target * v[i] / 100)}</td><td className="n">{cum}%</td></tr>; })}
    <tr><td colSpan={2}><b>Total</b></td><td className="n" style={{ color: ok ? COL.green : COL.red }}><b>{sum}%</b></td><td className="n">{N(tot.target * sum / 100)}</td><td /></tr></tbody></table></div>
    {!ok && <div className="err">Shares must add up to 100%. Currently {sum}%.</div>}
    <div className="row"><button className="btn" disabled={!ok} onClick={() => { setWeekPct(v); log(`Weekly shares set to ${v.join("/")}`); toast("Weekly shares saved. Expected pace recalculated."); }}>Save shares</button><span className="note">The last week absorbs the remaining days, so 28 to 31 day months all work.</span></div></Panel>;
}
function Users() {
  const rows = [["Rahul Verma", "Admin", "Full access"], ["Sunita Rao", "Management", "View, filter, export, share"], ["Mohan Das", "Management", "View, filter, export, share"], ["Neha Pillai", "Management", "View only"]];
  return <Panel title="Users and permissions"><Tbl cols={[{ k: "0", l: "User", r: (r) => <b>{r[0]}</b> }, { k: "1", l: "Role", r: (r) => r[1] }, { k: "2", l: "Access", r: (r) => r[2] }]} rows={rows} /><div className="note">Sample users. Real sign-in and role enforcement come with the backend.</div></Panel>;
}
function Settings({ X }) {
  const { th, setTh, audit } = X, f = (k, l, h) => <label className="fld">{l}<NumIn v={th[k]} on={(v) => setTh({ ...th, [k]: v })} /><em>{h}</em></label>;
  return <div className="stack"><Panel title="Alert and status thresholds">
    <div className="form2">{f("warn", "Attention when behind expected by (pts)", "Within this gap a zone, executive or dealer is On Track")}{f("crit", "Critical when behind expected by (pts)", "At or beyond this gap the status turns red")}{f("dg", "Daily On Track from (%)", "Share of the day's target")}{f("dr", "Daily Critical below (%)", "Share of the day's target")}{f("drop", "Reduced billing drop (%)", "Last 7 days vs previous 7 days")}{f("decl", "Article decline (%)", "Critical alert threshold")}{f("stable", "Stable band for month growth (±%)", "Growth inside this band shows as Stable")}</div>
    <div className="note">Changes apply to every dashboard and the Alert Center immediately.</div></Panel>
    <Panel title="Audit trail">{audit.length ? audit.map((a, i) => <div className="li" key={i}><span className="lt">{a[1]}<em>{a[0]} · Admin</em></span></div>) : <div className="empty">Admin changes appear here with who and when. Target changes are in each Target Management history.</div>}</Panel></div>;
}

/* ============================ ASK (voice and text questions) ============================ */
const SAMPLES = ["How are we doing this month?", "Which zones are behind pace?", "Which dealers have no billing?", "Show Zone 2 collection", "Top 5 dealers", "Which zone grew most vs last month?", "Which articles are declining?", "How did August go?"];
function answerQ(raw, X) {
  const q = " " + raw.toLowerCase().replace(/[^a-z0-9. ]/g, " ") + " ", has = (re) => re.test(q);
  const { TGm, th, weekPct, list } = X;
  let m = X.mi;
  const growthQ = has(/ (grew|grow|growth|growing|decline|declining|declined|drop|dropped|increase|compare|compared) /);
  if (has(/ (last|previous|prior) month /) && !growthQ) m = CUR - 1; else if (has(/ (this month|current month|today|now|so far) /)) m = CUR;
  else MN.forEach((n, ci) => { if (q.includes(" " + n.toLowerCase() + " ")) { const c = MONTHS.filter((x) => x.cm === ci && x.i <= CUR).pop(); if (c) m = c.i; } });
  const el = EL(m), ML = MONTHS[m].label;
  const T = (kind, type, k, l) => { const e = type ? TGm(kind, m, type, k) : undefined; return e !== undefined ? e : l.reduce((a, d) => a + (TGm(kind, m, "dealer", d.name) || 0), 0); };
  const cm = (l, o) => calc(l, { th, wp: weekPct, mi: m, target: T("sales", o && o.type, o && o.k, l), ctarget: T("coll", o && o.type, o && o.k, l), ...(o || {}) });
  const grp = (key, l = list) => groupBy(l, key).map(([k, g]) => ({ key: k, list: g, ...cm(g, { type: LT[key], k }) }));
  const stl = { green: "on track", amber: "needs attention", red: "critical" };
  const zm = q.match(/zone\s*(\d+)/), zone = zm ? "Zone " + zm[1] : null;
  const dealer = list.find((d) => q.includes(" " + d.name.toLowerCase() + " ")), exec = EX.find((e) => q.includes(" " + e[0].toLowerCase() + " "));
  const gz = (l, f) => gr(sumM(l, m, f), m > 0 ? sumM(l, m - 1, f, el) : 0);
  const gtxt = (g) => (g == null ? "n/a" : (g > 0 ? "+" : "") + g.toFixed(1) + "%");
  if (dealer) { const c = cm([dealer]), ser = seq(Math.max(0, m - 5), m).map((i) => `${MONTHS[i].short}: ${N(sumM([dealer], i, "cases"))}`); return { text: `${dealer.name} (${dealer.zone}, ${dealer.exec}) is at ${P(c.ach)} of its ${N(c.target)}-case target for ${ML}, against ${P(c.exp)} expected. Status: ${stl[c.st]}.`, rows: [["Cases", N(c.cases)], ["Sales value", INR(c.value)], ["Collection", `${INR(c.coll)} (${P(c.cAch)} of target)`], ["Growth vs previous month", gtxt(c.growth)], ...ser.map((x) => x.split(": "))], to: "dealers" }; }
  if (exec) { const r = grp("exec", list.filter((d) => d.exec === exec[0]))[0]; if (r) return { text: `${exec[0]} is at ${P(r.ach)} of target for ${ML} versus ${P(r.exp)} expected, so ${stl[r.st]}.`, rows: [["Target", N(r.target)], ["Actual", N(r.cases)], ["Gap", GAP(r.gap)], ["Active dealers", String(r.list.length)], ["Without billing", String(r.list.filter((d) => l7(d, m) === 0).length)]], to: "executives" }; }
  if (zone && list.some((d) => d.zone === zone) && !has(/ collection | collected | collect /)) { const r = grp("zone", list.filter((d) => d.zone === zone))[0]; return { text: `${zone} has delivered ${N(r.cases)} of ${N(r.target)} cases (${P(r.ach)}) in ${ML}. Expected pace is ${P(r.exp)}, so it is ${stl[r.st]}. Collection stands at ${P(r.cAch)} of target.`, rows: [["Gap to target", GAP(r.gap)], ["Sales value", INR(r.value)], ["Collected", INR(r.coll)], ["Growth vs previous month", gtxt(r.growth)]], to: "zones" }; }
  if (zone && !has(/ collection | collected | collect /)) return { text: `I couldn't find ${zone} in the current filters. Try resetting the filters.`, rows: [], to: "zones" };
  if (has(/ (no|zero|not) billing | inactive | not billed /)) { const nb = list.filter((d) => l7(d, m) === 0); return { text: nb.length ? `${nb.length} dealers have had no billing in the last 7 days of ${ML}.` : `Every dealer billed in the last 7 days of ${ML}.`, rows: nb.slice(0, 8).map((d) => [d.name, `${d.zone}, ${d.exec}`]), to: "dealers" }; }
  if (has(/ (top|best|highest|leading) /) && has(/ dealer/)) { const r = list.map((d) => ({ d, ...cm([d]) })).sort((a, b) => b.ach - a.ach).slice(0, 5); return { text: `Top dealers by achievement in ${ML}:`, rows: r.map((x) => [x.d.name, `${P(x.ach)} · ${N(x.cases)} cases`]), to: "dealers" }; }
  if (has(/ (bottom|worst|lowest|weak|lagging) /) && has(/ dealer/)) { const r = list.map((d) => ({ d, ...cm([d]) })).filter((x) => x.cases > 0).sort((a, b) => a.ach - b.ach).slice(0, 5); return { text: `Lowest-achieving dealers (with billing) in ${ML}:`, rows: r.map((x) => [x.d.name, `${P(x.ach)} · ${N(x.cases)} cases`]), to: "dealers" }; }
  if (has(/ collection | collected | collect /)) { const zl = zone ? list.filter((d) => d.zone === zone) : list, t = cm(zl, zone ? { type: "zone", k: zone } : { type: X.noFilter ? "company" : undefined, k: "Company" }), zr = zone ? [] : grp("zone").sort((a, b) => a.cAch - b.cAch); return { text: `${zone ? zone + " collection" : "Collection"} for ${ML} is ${INR(t.coll)}, which is ${P(t.cAch)} of the ${INR(t.ctarget)} target against ${P(t.cExp)} expected. Growth vs previous month: ${gtxt(t.collGrowth)}.`, rows: zr.map((z) => [z.key, `${P(z.cAch)} · ${LB.coll[z.cSt]}`]), to: "collection" }; }
  if (has(/ (grew|grow|growth|growing|decline|declining|declined|drop|dropped|increase|compare|compared) /)) {
    if (has(/ article/)) { const a = artStats(list, m).filter((x) => x.growth != null).sort((x, y) => (has(/ declin/) ? x.growth - y.growth : y.growth - x.growth)); return { text: a.length ? `Versus the same days of the previous month, the biggest movers are Article ${a[0].a} (${gtxt(a[0].growth)}) and Article ${a[a.length - 1].a} (${gtxt(a[a.length - 1].growth)}).` : "No earlier month to compare.", rows: a.map((x) => ["Article " + x.a, gtxt(x.growth)]), to: "compare" }; }
    const z = groupBy(list, "zone").map(([k, l]) => ({ k, g: gz(l, "cases") })).filter((x) => x.g != null).sort((a, b) => b.g - a.g);
    return { text: z.length ? `For ${ML} versus the same days of the previous month, ${z[0].k} grew most (${gtxt(z[0].g)}) and ${z[z.length - 1].k} was weakest (${gtxt(z[z.length - 1].g)}).` : "No earlier month to compare.", rows: z.map((x) => [x.k, gtxt(x.g)]), to: "compare" };
  }
  if (has(/ article/)) { const a = artStats(list, m).sort((x, y) => y.cases - x.cases).slice(0, 5); return { text: `Top articles by cases in ${ML}:`, rows: a.map((x) => ["Article " + x.a, `${N(x.cases)} cases · ${P(x.contrib)} · 7-day trend ${gtxt(x.trend)}`]), to: "articles" }; }
  if (has(/ (behind|pace|critical|attention|lagging|below|off track|risk) /) || (zone === null && has(/ zones? /))) { const z = grp("zone").sort((a, b) => a.pace - b.pace), bad = z.filter((x) => x.st !== "green"); return { text: bad.length ? `${bad.length} of ${z.length} zones are behind expected pace in ${ML}. ${bad[0].key} is furthest behind at ${Math.abs(bad[0].pace).toFixed(1)} points.` : `All zones are on track for ${ML}.`, rows: z.map((x) => [x.key, `${P(x.ach)} vs ${P(x.exp)} expected · ${stl[x.st]}`]), to: "zones" }; }
  if (has(/ (target|achiev|achieved|sales|overall|status|summary|cases|doing|performance|where|gap|go|went) /)) { const t = cm(list, { type: X.noFilter ? "company" : undefined, k: "Company" }); return { text: `In ${ML}, ${N(t.cases)} of ${N(t.target)} cases are done (${P(t.ach)}). Expected pace is ${P(t.exp)}, so we are ${Math.abs(t.pace).toFixed(1)} points ${t.pace >= 0 ? "ahead" : "behind"} and the status is ${stl[t.st]}.`, rows: [["Gap to target", GAP(t.gap)], ["Sales value", INR(t.value)], ["Collection", `${INR(t.coll)} (${P(t.cAch)})`], ["Vs previous month", gtxt(t.growth)]], to: "monthly" }; }
  return { text: "I didn't understand that one. Try asking about a zone, a dealer, an executive, collection, articles, growth or billing, and mention a month if you need one.", rows: [], to: null };
}
function Ask({ X }) {
  const [msgs, setMsgs] = useState([]), [text, setText] = useState(""), [listen, setListen] = useState(false), [speak, setSpeak] = useState(false), [note, setNote] = useState("");
  const send = (qq) => { const q = (qq ?? text).trim(); if (!q) return; const a = answerQ(q, X); setMsgs((m) => [...m, { q, a }]); setText(""); if (speak && typeof window !== "undefined" && window.speechSynthesis) { try { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(a.text)); } catch (e) { /* speech output unavailable */ } } };
  const mic = () => { const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition); if (!SR) { setNote("Voice input isn't available in this browser or preview. Type your question instead."); return; } try { const r = new SR(); r.lang = "en-IN"; r.onstart = () => { setListen(true); setNote(""); }; r.onend = () => setListen(false); r.onerror = () => { setListen(false); setNote("Couldn't hear that. Check microphone permission or type instead."); }; r.onresult = (e) => { const t = e.results[0][0].transcript; setText(t); send(t); }; r.start(); } catch (e) { setNote("Voice input couldn't start here. Type your question instead."); } };
  return <div className="stack">
    <Panel title="Ask about your data" right={<label className="inl"><input type="checkbox" checked={speak} onChange={(e) => setSpeak(e.target.checked)} /> Read answers aloud</label>}>
      <div className="askbar"><button className={"micbtn" + (listen ? " live" : "")} onClick={mic} aria-label="Speak your question">{listen ? "Listening…" : "Speak"}</button><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask, e.g. Which zones are behind pace?" /><button className="btn" onClick={() => send()}>Ask</button></div>
      {note && <div className="err" style={{ fontWeight: 500 }}>{note}</div>}
      <div className="chips" style={{ marginTop: 10 }}>{SAMPLES.map((s) => <button key={s} className="chip" onClick={() => send(s)}>{s}</button>)}</div>
      <div className="note" style={{ marginTop: 8 }}>Answers use the selected month ({MONTHS[X.mi].label}) and current filters unless you name a month. Prototype note: this demo matches common question patterns. The real version has Claude interpret any wording, then reads figures from the database.</div></Panel>
    {msgs.length === 0 && <div className="empty">No questions yet. Tap a suggestion above.</div>}
    {[...msgs].reverse().map((m, i) => <Panel key={msgs.length - i}><div className="qline">{m.q}</div><p className="ans">{m.a.text}</p>
      {m.a.rows.length > 0 && <div className="tw"><table><tbody>{m.a.rows.map((r, j) => <tr key={j}><td>{r[0]}</td><td className="n"><b>{r[1]}</b></td></tr>)}</tbody></table></div>}
      {m.a.to && <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => X.go(m.a.to)}>Open {TITLES[m.a.to]}</button>}</Panel>)}</div>;
}

/* ============================ APP SHELL ============================ */
const NAV = [{ k: "overview", l: "Overview" }, { k: "ask", l: "Ask" }, { g: "Dashboard", items: [["daily", "Daily"], ["weekly", "Weekly"], ["monthly", "Monthly"], ["compare", "Month Comparison"]] }, { k: "sales", l: "Sales" }, { k: "articles", l: "Articles" }, { k: "dealers", l: "Dealers" }, { k: "zones", l: "Zones" }, { k: "executives", l: "Executives" }, { k: "collection", l: "Collection" }, { k: "alerts", l: "Alerts", badge: 1 }, { k: "reports", l: "Reports" },
  { g: "Admin", admin: 1, items: [["upload", "Data Upload"], ["master", "Master Data"], ["stargets", "Sales Target Management"], ["ctargets", "Collection Target Management"], ["weekset", "Weekly Target Settings"], ["users", "Users & Permissions"], ["settings", "Settings"]] }];
const TITLES = Object.fromEntries(NAV.flatMap((n) => n.items ? n.items.map(([k, l]) => [k, l]) : [[n.k, n.l]]));
const ADMIN_PAGES = ["upload", "master", "stargets", "ctargets", "weekset", "users", "settings"], NOFILTER = ADMIN_PAGES;
const SEED = seedTargets();
const HIST_SEED = [{ when: "02-09-2026 10:14", kind: "sales", m: 11, type: "zone", e: "Zone 2", from: 3800, to: 3500, act: "Updated" }, { when: "01-09-2026 09:30", kind: "sales", m: 11, type: "dealer", e: "Sree Traders", from: null, to: 480, act: "Added" }, { when: "01-09-2026 09:12", kind: "coll", m: 11, type: "zone", e: "Zone 1", from: 3800000, to: 4000000, act: "Updated" }];

export default function App({ initialPage = "overview" }) {
  const [role, setRole] = useState("Admin"), [page, setPage] = useState(initialPage), [menu, setMenu] = useState(false), [toastMsg, setToastMsg] = useState(""), [share, setShare] = useState(false), [mi, setMi] = useState(CUR);
  const [zones, setZones] = useState(ZONES0.map((z) => ({ ...z }))), [dealers, setDealers] = useState(DEALERS0), [weekPct, setWeekPct] = useState(WP0), [tg, setTg] = useState(SEED), [hist, setHist] = useState(HIST_SEED);
  const [th, setTh] = useState({ warn: 3, crit: 10, dg: 90, dr: 70, drop: 30, decl: 20, stable: 2 }), [f, setF] = useState({ state: "", zone: "", exec: "", ae: "", dealer: "" }), [audit, setAudit] = useState([]);
  const toast = (m) => { setToastMsg(m); setTimeout(() => setToastMsg(""), 2600); };
  const log = (m) => setAudit((a) => [[new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), m], ...a]);
  const stamp = () => new Date().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", "");
  const setT = (kind, m, type, e, v, on, act) => { const k = `${m}|${type}|${e}`, old = tg[kind][k]; setTg((t) => ({ ...t, [kind]: { ...t[kind], [k]: { v, on } } })); setHist((h) => [{ when: stamp(), kind, m, type, e, from: old ? old.v : null, to: v, act }, ...h]); };
  const delT = (kind, m, type, e) => { const k = `${m}|${type}|${e}`, old = tg[kind][k]; setTg((t) => { const n = { ...t[kind] }; delete n[k]; return { ...t, [kind]: n }; }); setHist((h) => [{ when: stamp(), kind, m, type, e, from: old ? old.v : null, to: null, act: "Deleted" }, ...h]); };
  const batch = (kind, pairs, act, m) => { setTg((t) => ({ ...t, [kind]: { ...t[kind], ...Object.fromEntries(pairs) } })); setHist((h) => [{ when: stamp(), kind, m, type: "company", e: `${pairs.length} targets`, from: null, to: null, act }, ...h]); };
  const TGm = useCallback((kind, m, type, e) => { const x = tg[kind][`${m}|${type}|${e}`]; return x && x.on ? x.v : undefined; }, [tg]);
  const TG = (kind, type, e) => (type ? TGm(kind, mi, type, e) : undefined);
  const C = useCallback((l, o) => calc(l, { th, wp: weekPct, mi, ...o }), [th, weekPct, mi]);
  const G = useCallback((list, key, o) => groupBy(list, key).map(([k, l]) => { const type = LT[key]; return { key: k, list: l, ...C(l, { ...o, target: type ? TGm("sales", mi, type, k) : undefined, ctarget: type ? TGm("coll", mi, type, k) : undefined }) }; }), [C, TGm, mi]);
  const zByName = useMemo(() => Object.fromEntries(zones.map((z) => [z.id, z])), [zones]);
  const all = useMemo(() => dealers.map((d) => { const z = zByName[d.zoneId], zt = TGm("sales", mi, "zone", z.name) || 0, zc = TGm("coll", mi, "zone", z.name) || 0; return { ...d, zone: z.name, state: z.state, target: TGm("sales", mi, "dealer", d.name) ?? Math.round(zt * d.share), ctarget: TGm("coll", mi, "dealer", d.name) ?? Math.round(zc * d.share) }; }), [dealers, zByName, TGm, mi]);
  const base = useMemo(() => all.filter((d) => d.status === "Active"), [all]);
  const list = useMemo(() => base.filter((d) => (!f.state || d.state === f.state) && (!f.zone || d.zoneId === f.zone) && (!f.exec || d.exec === f.exec) && (!f.ae || d.ae === f.ae) && (!f.dealer || d.name === f.dealer)), [base, f]);
  const noFilter = !(f.state || f.zone || f.exec || f.ae || f.dealer);
  const scope = (kind) => { if (f.dealer) return TGm(kind, mi, "dealer", f.dealer); const n = [f.state, f.zone, f.exec, f.ae].filter(Boolean).length; if (!n) return TGm(kind, mi, "company", "Company"); if (n === 1 && f.zone) return TGm(kind, mi, "zone", zByName[f.zone].name); if (n === 1 && f.exec) return TGm(kind, mi, "exec", f.exec); if (n === 1 && f.ae) return TGm(kind, mi, "ae", f.ae); return undefined; };
  const tot = useMemo(() => C(list, { target: scope("sales"), ctarget: scope("coll") }), [C, list, f, TGm]);
  const zoneRows = useMemo(() => G(list, "zone"), [G, list]), alerts = useMemo(() => buildAlerts(list, C, G, th, mi), [list, C, G, th, mi]);
  const go = (p) => { setPage(p); setMenu(false); if (typeof window !== "undefined" && window.scrollTo) window.scrollTo(0, 0); };
  const el = EL(mi), days = MONTHS[mi].days;
  const X = { all, list, tot, zoneRows, alerts, C, G, go, zones, setZones, dealers, setDealers, weekPct, setWeekPct, th, setTh, log, audit, mi, el, days, tg, TGm, TG, setT, delT, batch, hist, noFilter };
  const states = [...new Set(zones.map((z) => z.state))], sub = (upTo) => base.filter((d) => (upTo < 1 || !f.state || d.state === f.state) && (upTo < 2 || !f.zone || d.zoneId === f.zone) && (upTo < 3 || !f.exec || d.exec === f.exec) && (upTo < 4 || !f.ae || d.ae === f.ae));
  const zopts = zones.filter((z) => !f.state || z.state === f.state), eopts = [...new Set(sub(2).map((d) => d.exec))], aopts = [...new Set(sub(3).map((d) => d.ae))], dopts = sub(4).map((d) => d.name);
  const admin = role === "Admin", cur = !admin && ADMIN_PAGES.includes(page) ? "overview" : page, crit = alerts.filter((a) => a.sev === "red").length, reset = { state: "", zone: "", exec: "", ae: "", dealer: "" };
  const fl = [f.state, f.zone && zByName[f.zone].name, f.exec, f.ae, f.dealer].filter(Boolean).join(",");
  const link = `https://tracker.example.com/view/${cur}?month=${MONTHS[mi].y}-${String(MONTHS[mi].cm + 1).padStart(2, "0")}${fl ? "&filters=" + fl : ""}`;
  const pk = (c) => c;
  const pages = { overview: <Overview key={mi} X={X} />, ask: <Ask X={X} />, daily: <Daily key={mi} X={X} />, weekly: <Weekly key={mi} X={X} />, monthly: <Monthly key={mi} X={X} />, compare: <Compare X={X} />, sales: <Sales X={X} />, articles: <Articles key={mi} X={X} />, dealers: <Dealers key={mi} X={X} />, zones: <Zones X={X} />, executives: <Execs key={mi} X={X} />, collection: <Collection key={mi} X={X} />, alerts: <Alerts X={X} />, reports: <Reports X={X} toast={toast} />, upload: <Upload />, master: <Master X={X} toast={toast} />, stargets: <TargetMgr X={X} kind="sales" toast={toast} />, ctargets: <TargetMgr X={X} kind="coll" toast={toast} />, weekset: <WeekSet X={X} toast={toast} />, users: <Users />, settings: <Settings X={X} /> };
  const Sel = ({ v, on, ph, opts }) => <select value={v} onChange={(e) => on(e.target.value)}><option value="">{ph}</option>{opts.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>;
  return <div className="app"><style>{CSS}</style>
    <aside className={"side" + (menu ? " open" : "")}><div className="brand"><b>Sales & Collection</b><span>Management tracker</span></div>
      <nav>{NAV.filter((n) => !n.admin || admin).map((n, i) => n.items ? <div key={i}><div className="grp">{n.g}</div>{n.items.map(([k, l]) => <button key={k} className={cur === k ? "on" : ""} onClick={() => go(k)}>{l}</button>)}</div> : <button key={n.k} className={cur === n.k ? "on" : ""} onClick={() => go(n.k)}>{n.l}{n.badge && crit > 0 ? <span className="cnt">{crit}</span> : null}</button>)}</nav></aside>
    {menu && <div className="scrim" onClick={() => setMenu(false)} />}
    <div className="main"><header className="top"><button className="menu" onClick={() => setMenu(true)} aria-label="Open menu">☰</button><div><h1>{TITLES[cur]}</h1><span className="asof">Data as of 15 Sep 2026</span></div>
      <div className="tr"><select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Preview role"><option>Admin</option><option>Management</option></select><button className="btn ghost" onClick={() => setShare(true)}>Share</button></div></header>
      {!NOFILTER.includes(cur) && <div className="mbar"><span className="ml">Month</span><select className="msel" value={mi} onChange={(e) => setMi(+e.target.value)} aria-label="Month">{seq(0, CUR).reverse().map((m) => <option key={m} value={m}>{MONTHS[m].label}</option>)}</select>
        <button className={"chip" + (mi === CUR ? " on" : "")} onClick={() => setMi(CUR)}>Current month</button><button className={"chip" + (mi === CUR - 1 ? " on" : "")} onClick={() => setMi(CUR - 1)}>Previous month</button>{mi === CUR ? <span className="note">Month to date, day {CUR_DAY} of {days}</span> : <span className="note">Full month</span>}</div>}
      {!NOFILTER.includes(cur) && <div className="filters"><Sel v={f.state} on={(v) => setF({ ...reset, state: v })} ph="All states" opts={states.map((s) => [s, s])} />
        <Sel v={f.zone} on={(v) => setF({ ...f, zone: v, exec: "", ae: "", dealer: "" })} ph="All zones" opts={zopts.map((z) => [z.id, z.name])} /><Sel v={f.exec} on={(v) => setF({ ...f, exec: v, ae: "", dealer: "" })} ph="All executives" opts={eopts.map((e) => [e, e])} />
        <Sel v={f.ae} on={(v) => setF({ ...f, ae: v, dealer: "" })} ph="All assistants" opts={aopts.map((e) => [e, e])} /><Sel v={f.dealer} on={(v) => setF({ ...f, dealer: v })} ph="All dealers" opts={dopts.map((e) => [e, e])} />
        <button className="btn ghost sm" onClick={() => setF(reset)}>Reset filters</button><span className="note">{list.length} dealers</span></div>}
      <main className="content">{list.length || NOFILTER.includes(cur) ? pages[pk(cur)] : <div className="panel"><div className="empty">No dealers match these filters. Reset filters to see all data.</div></div>}</main></div>
    {share && <div className="modal" onClick={() => setShare(false)}><div className="box" onClick={(e) => e.stopPropagation()}><h3>Share dashboard</h3>
      {[["Read-only management link", link], ["Filtered link (current month and filters)", link]].map(([l, u]) => <div key={l} className="sl"><label>{l}</label><div className="row"><input readOnly value={u} /><button className="btn sm" onClick={() => { try { navigator.clipboard.writeText(u); } catch (e) { /* clipboard unavailable */ } toast("Link copied"); }}>Copy</button></div></div>)}
      <div className="note">Shared links hide all admin controls. User-based access is set in Users and permissions.</div><button className="btn ghost" onClick={() => setShare(false)}>Close</button></div></div>}
    {cur !== "ask" && !ADMIN_PAGES.includes(cur) && <button className="fab" onClick={() => go("ask")} aria-label="Ask a question">Ask</button>}
    {toastMsg && <div className="toast">{toastMsg}</div>}</div>;
}

const CSS = `
.app{--bg:#EDF0F2;--sf:#fff;--ink:#10222B;--mu:#5B6B73;--ln:#D9DFE3;--pt:#0E4B5A;--pd:#0A2F39;font-family:"IBM Plex Sans","Segoe UI",system-ui,sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;display:flex;font-size:14px;font-variant-numeric:tabular-nums}
.app *{box-sizing:border-box}.app h1{font-size:19px;margin:0;font-weight:600}.app h3{font-size:14px;margin:0;font-weight:600}.app h4{margin:6px 0 0;font-size:13px}.mu{color:var(--mu)}
.side{width:224px;background:var(--pd);color:#CFE0E4;flex-shrink:0;padding:16px 10px;position:sticky;top:0;height:100vh;overflow-y:auto}
.brand{padding:4px 10px 16px}.brand b{display:block;color:#fff;font-size:15px}.brand span{font-size:12px;color:#8FB2BB}
.side nav button{display:flex;justify-content:space-between;align-items:center;width:100%;text-align:left;background:none;border:0;color:inherit;padding:8px 10px;border-radius:6px;cursor:pointer;font:inherit}
.side nav button:hover{background:#ffffff14}.side nav button.on{background:#fff;color:var(--pd);font-weight:600}
.grp{padding:14px 10px 4px;font-size:12px;color:#8FB2BB}.cnt{background:#C93B3B;color:#fff;border-radius:9px;font-size:11px;padding:1px 7px}
.main{flex:1;min-width:0}.top{display:flex;align-items:center;gap:12px;padding:14px 20px;background:var(--sf);border-bottom:1px solid var(--ln);position:sticky;top:0;z-index:5}
.asof{font-size:12px;color:var(--mu)}.tr{margin-left:auto;display:flex;gap:8px}.menu{display:none;background:none;border:0;font-size:20px;cursor:pointer}
.mbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 20px;background:#E3EEF1;border-bottom:1px solid var(--ln)}.ml{font-weight:600;color:var(--pt)}.msel{font-weight:600;min-width:150px}
.filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 20px;background:#F7F9FA;border-bottom:1px solid var(--ln)}
.content{padding:20px;max-width:1280px}.stack{display:flex;flex-direction:column;gap:16px}
select,input{font:inherit;border:1px solid var(--ln);border-radius:6px;padding:6px 8px;background:#fff;color:var(--ink);max-width:100%}label{display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--mu)}.row>label{min-width:110px}
.btn{font:inherit;background:var(--pt);color:#fff;border:1px solid var(--pt);border-radius:6px;padding:7px 14px;cursor:pointer;font-weight:500}.btn:hover{background:var(--pd)}
.btn.ghost{background:#fff;color:var(--pt)}.btn.ghost:hover{background:#EAF2F4}.btn.sm{padding:4px 10px;font-size:12px}.btn:disabled{opacity:.4;cursor:not-allowed}
button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid #2B7A8C;outline-offset:1px}
.panel{background:var(--sf);border:1px solid var(--ln);border-radius:10px;padding:16px}.panel>header{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px}.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.kpi{background:var(--sf);border:1px solid var(--ln);border-radius:10px;padding:12px 14px}.kl{font-size:12px;color:var(--mu)}.kv{font-size:22px;font-weight:600;margin-top:2px}.kv .sm{font-size:14px}.ks{font-size:12px;color:var(--mu);margin-top:2px}
.insight{background:var(--sf);border:1px solid var(--ln);border-left:4px solid var(--pt);border-radius:10px;padding:14px}.ih{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px}.ih .tabs{margin:0}
.ig{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.ig .kpi{background:#F7F9FA}
.hero{background:var(--pd);color:#fff;border-radius:12px;padding:20px;display:grid;grid-template-columns:1.4fr 1fr;gap:20px}.hero .kl{color:#9CC1C9}.hv{font-size:38px;font-weight:600;margin:4px 0 14px}.hv small{font-size:15px;color:#9CC1C9;font-weight:400}
.hero .prog{height:14px;background:#ffffff26}.hleg{display:flex;justify-content:space-between;font-size:12px;color:#CFE0E4;margin-top:6px}
.hgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.hero .kpi{background:#ffffff12;border-color:#ffffff22}.hero .kv{font-size:18px}
.prog{position:relative;height:8px;background:#E3E9EC;border-radius:4px;flex:1;min-width:60px}.prog i{position:absolute;left:0;top:0;bottom:0;border-radius:4px}.prog b{position:absolute;top:-3px;bottom:-3px;width:2px;background:#10222B;border-radius:1px}.hero .prog b{background:#fff}
.badge{display:inline-flex;align-items:center;gap:6px;padding:2px 9px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap}.badge i{width:7px;height:7px;border-radius:50%}
.gd{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:6px}.gl{font-style:normal;font-weight:500;font-size:11px}
.zr{display:grid;grid-template-columns:64px 1fr 52px 118px;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid #EEF1F3;cursor:pointer}.zn{font-weight:600}.zp{text-align:right;font-weight:600}
.li{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #EEF1F3}.li:last-child{border:0}.li.click{cursor:pointer}.lt{flex:1;display:flex;flex-direction:column}.lt em{font-style:normal;font-size:12px;color:var(--mu)}
.rk{width:22px;height:22px;border-radius:50%;background:#E3EEF1;color:var(--pt);display:grid;place-items:center;font-size:12px;font-weight:600}.dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.link{background:none;border:0;color:var(--pt);cursor:pointer;font:inherit;font-weight:500}
.tw{overflow-x:auto}table{width:100%;border-collapse:collapse}th{text-align:left;font-size:12px;color:var(--mu);font-weight:600;padding:8px 10px;border-bottom:1px solid var(--ln);cursor:pointer;white-space:nowrap}td{padding:9px 10px;border-bottom:1px solid #EEF1F3;white-space:nowrap}
th.n,td.n{text-align:right}tr.click{cursor:pointer}tr.click:hover td{background:#F4F8F9}.empty{color:var(--mu);padding:14px 4px}.ach{display:flex;align-items:center;gap:8px;justify-content:flex-end;min-width:130px}.ach span{width:48px;text-align:right}
.tabs{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px}.tabs button,.chip{font:inherit;background:#fff;border:1px solid var(--ln);border-radius:16px;padding:4px 12px;cursor:pointer;color:var(--mu);display:inline-flex;align-items:center;gap:6px}.tabs button.on,.chip.on{background:var(--pt);color:#fff;border-color:var(--pt)}.tabs button:disabled{opacity:.4;cursor:not-allowed}.chip i{width:9px;height:9px;border-radius:50%}
.chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:8px}
.ctip{background:#fff;border:1px solid var(--ln);border-radius:8px;padding:8px 10px;font-size:12px;box-shadow:0 4px 14px #0002;min-width:170px}.ctr{display:flex;flex-direction:column;margin-top:6px;color:var(--mu)}.ctr span:first-child{color:var(--ink)}.ctr i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}
.pager{display:flex;gap:12px;align-items:center;justify-content:flex-end;padding-top:10px;font-size:12px;color:var(--mu)}.pager button{font:inherit;border:1px solid var(--ln);background:#fff;border-radius:6px;padding:3px 10px;cursor:pointer}.pager button:disabled{opacity:.4}
.row{display:flex;flex-wrap:wrap;align-items:flex-end;gap:10px}.note{font-size:12px;color:var(--mu)}.err{color:#C93B3B;margin:8px 0;font-weight:600}.ok{margin-top:10px;background:#1E8E5A1A;color:#176B44;padding:8px 12px;border-radius:6px;font-size:13px}
.crumbs{margin-bottom:8px}.crumbs button{background:none;border:0;color:var(--pt);cursor:pointer;font:inherit;font-weight:600;padding:0}
.ol{margin:0;padding-left:0;list-style:none}.ol li{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #EEF1F3}.ol .sep{border-bottom:2px solid var(--ln);padding:2px}
.alert{display:flex;align-items:center;gap:12px;border-left:4px solid;padding:10px 12px;background:#F8FAFB;border-radius:0 8px 8px 0;margin-bottom:8px}.alert>div{flex:1;display:flex;flex-direction:column}.alert em{font-style:normal;font-size:12px;color:var(--mu)}
.heat{display:inline-block;min-width:40px;padding:2px 6px;border-radius:4px;text-align:right}.search{width:200px}
.steps{display:flex;flex-wrap:wrap;gap:14px;margin:14px 0;font-size:13px;color:var(--mu)}.steps .on{color:var(--pt);font-weight:600}
.drop{border:2px dashed var(--ln);border-radius:10px;padding:28px;text-align:center;color:var(--mu)}
.form{display:flex;flex-wrap:wrap;gap:8px}.form2{display:grid;grid-template-columns:1fr 1fr;gap:14px}.fld{display:flex;flex-direction:column;gap:4px;font-weight:500;font-size:14px;color:var(--ink)}.fld em{font-style:normal;font-weight:400;font-size:12px;color:var(--mu)}
input.num{width:110px;text-align:right}.modal{position:fixed;inset:0;background:#0A2F3999;display:grid;place-items:center;z-index:20;padding:16px}.box{background:#fff;border-radius:12px;padding:20px;width:480px;max-width:100%;display:flex;flex-direction:column;gap:12px}.sl input{flex:1;min-width:0}.sl label{font-size:12px;color:var(--mu)}
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--pd);color:#fff;padding:10px 16px;border-radius:8px;z-index:30;box-shadow:0 4px 16px #0004}.scrim{display:none}
@media(max-width:900px){.side{position:fixed;z-index:15;left:0;top:0;transform:translateX(-100%);transition:transform .2s}.side.open{transform:none}.scrim{display:block;position:fixed;inset:0;background:#0006;z-index:12}.menu{display:block}
.g4{grid-template-columns:1fr 1fr}.g2,.g3,.hero{grid-template-columns:1fr}.content{padding:12px}.top,.filters,.mbar{padding-left:12px;padding-right:12px}.hv{font-size:30px}.form2{grid-template-columns:1fr}.zr{grid-template-columns:56px 1fr 48px}.zr .badge{display:none}.filters select{flex:1 1 44%}}
.fab{position:fixed;right:18px;bottom:18px;z-index:9;background:var(--pt);color:#fff;border:0;border-radius:24px;padding:11px 20px;font:inherit;font-weight:600;cursor:pointer;box-shadow:0 4px 14px #0004}
.askbar{display:flex;gap:8px;flex-wrap:wrap}.askbar input{flex:1;min-width:180px;padding:9px 10px}.micbtn{font:inherit;font-weight:600;border:1px solid var(--pt);background:#fff;color:var(--pt);border-radius:6px;padding:8px 16px;cursor:pointer}.micbtn.live{background:#C93B3B;border-color:#C93B3B;color:#fff}
.inl{flex-direction:row;align-items:center;gap:6px}.qline{font-weight:600;color:var(--pt);margin-bottom:6px}.ans{margin:0 0 10px;line-height:1.5}
@media(prefers-reduced-motion:reduce){.side{transition:none}}
`;
