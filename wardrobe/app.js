'use strict';
/* =====================================================================
   خزانتي — digital wardrobe & outfit stylist.
   Everything runs on the device: photos and data live in IndexedDB.
   The only network call is optional weather (Open-Meteo, no key).
   ===================================================================== */

/* ---------------- constants ---------------- */
const CATS = [
  {id:'top',    ar:'فوق',        e:'👕', ph:'مثلاً: قميص كتان'},
  {id:'bottom', ar:'تحت',        e:'👖', ph:'مثلاً: جينز واسع'},
  {id:'full',   ar:'قطعة كاملة', e:'👗', ph:'مثلاً: فستان، ثوب، عباية'},
  {id:'outer',  ar:'جاكيت',      e:'🧥', ph:'مثلاً: بليزر، كارديغان، بشت'},
  {id:'shoes',  ar:'حذاء',       e:'👟', ph:'مثلاً: سنيكرز أبيض'},
  {id:'bag',    ar:'شنطة',       e:'👜', ph:'مثلاً: شنطة كتف'},
  {id:'acc',    ar:'إكسسوار',    e:'⌚', ph:'مثلاً: ساعة، نظارة، شماغ، طرحة'},
];
const CAT = Object.fromEntries(CATS.map(c=>[c.id,c]));
const ORDER = ['outer','top','full','bottom','shoes','bag','acc'];
const OCCS = [
  {id:'casual',ar:'كاجوال',e:'☕'},{id:'work',ar:'دوام/جامعة',e:'💼'},{id:'out',ar:'طلعة/عشاء',e:'🌙'},
  {id:'event',ar:'مناسبة',e:'🎉'},{id:'sport',ar:'رياضة',e:'🏃'},{id:'travel',ar:'سفر',e:'✈️'},
];
const OCC = Object.fromEntries(OCCS.map(o=>[o.id,o]));
const WX = [{id:'hot',ar:'حر',e:'☀️'},{id:'mild',ar:'معتدل',e:'⛅'},{id:'cold',ar:'برد',e:'❄️'}];
const WXM = Object.fromEntries(WX.map(w=>[w.id,w]));
const SEASONS = [{id:'summer',ar:'صيفي'},{id:'winter',ar:'شتوي'},{id:'all',ar:'كل الفصول'}];
const CURS = ['ر.س','د.إ','د.ك','ر.ق','د.ب','ر.ع','$','€'];
const PALETTE = [ // hex, name, neutral
  ['#111111','أسود',1],['#F5F5F2','أبيض',1],['#8A8A8A','رمادي',1],['#3A3A3F','فحمي',1],
  ['#F1E6D2','كريمي',1],['#D6C3A3','بيج',1],['#B49A74','خاكي',1],['#6B4A33','بني',1],['#9C6B3F','جملي',1],
  ['#1E2A4A','كحلي',1],['#4A6A8F','جينز',1],['#9CB6D4','سماوي',0],['#2F5BD3','أزرق',0],
  ['#1F7A6B','تركوازي',0],['#556B2F','زيتي',1],['#3E8E4E','أخضر',0],['#A8C99A','نعناعي',0],
  ['#E8D44D','أصفر',0],['#E9A23B','خردلي',0],['#E8742E','برتقالي',0],
  ['#C0392B','أحمر',0],['#7A1F2B','عنابي',0],['#E8A0B4','وردي',0],['#D94C8A','فوشي',0],
  ['#C9B6E4','ليلكي',0],['#6B3FA0','بنفسجي',0],['#C8A27A','ذهبي',0],['#C0C0C8','فضي',1],
];

/* ---------------- icons ---------------- */
const IC = {
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  unlock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-1.8"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  heartF:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  shuffle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="13" height="13" rx="2"/><path d="M3 8v11a2 2 0 0 0 2 2h11"/></svg>',
  down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="13" height="13" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v11"/></svg>',
  big:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M8 11h6M11 8v6M20 20l-4-4"/></svg>',
  small:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M8 11h6M20 20l-4-4"/></svg>',
  prev:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>',
  next:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>',
  search:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  pin:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
};

/* ---------------- storage ---------------- */
const DB = (() => {
  let dbp;
  function open(){
    if (dbp) return dbp;
    dbp = new Promise((res,rej)=>{
      const r = indexedDB.open('khzanti',2);
      r.onupgradeneeded = e => {
        const d = r.result;
        if (e.oldVersion < 1){ d.createObjectStore('items',{keyPath:'id'}); d.createObjectStore('outfits',{keyPath:'id'}); d.createObjectStore('kv'); }
        if (e.oldVersion < 2){ d.createObjectStore('plans',{keyPath:'date'}); d.createObjectStore('trips',{keyPath:'id'}); }
      };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  async function tx(store, mode, fn){
    const d = await open();
    return new Promise((res,rej)=>{
      const t = d.transaction(store, mode), s = t.objectStore(store), out = fn(s);
      t.oncomplete = () => res(out && 'result' in out ? out.result : undefined);
      t.onerror = () => rej(t.error);
    });
  }
  return {
    all:s=>tx(s,'readonly',st=>st.getAll()),
    get:(s,k)=>tx(s,'readonly',st=>st.get(k)),
    put:(s,v,k)=>tx(s,'readwrite',st=>k===undefined?st.put(v):st.put(v,k)),
    putMany:(s,vs)=>tx(s,'readwrite',st=>{vs.forEach(v=>st.put(v));}),
    del:(s,k)=>tx(s,'readwrite',st=>st.delete(k)),
    clear:s=>tx(s,'readwrite',st=>st.clear()),
  };
})();

/* ---------------- state ---------------- */
const now0 = new Date();
const S = {
  items:[], outfits:[], plans:{}, trips:[], set:{cur:'ر.س', wxOn:false, tipClosed:false},
  view:'closet',
  closet:{cat:'all', q:'', color:null, sort:'new', laundry:false},
  oTab:'style', occ:'casual', wx:null, wxManual:false, wxInfo:null, planDate:null,
  results:[], idx:0, locks:{},
  pTab:'cal', cal:{y:now0.getFullYear(), m:now0.getMonth()},
};

/* ---------------- helpers ---------------- */
const $ = id => document.getElementById(id);
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId = id => S.items.find(i=>i.id===id);
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const pick = a => a[Math.floor(Math.random()*a.length)];
const pad2 = n => String(n).padStart(2,'0');
const ymd = d => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
const parseYmd = s => { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d,12); };
const today = () => ymd(new Date());
const addDays = (s,n) => { const d=parseYmd(s); d.setDate(d.getDate()+n); return ymd(d); };
const LOC = 'ar-u-ca-gregory-nu-latn';
const fmtDate = (s,o={weekday:'long',day:'numeric',month:'long'}) => parseYmd(s).toLocaleDateString(LOC,o);
const daysSince = ts => ts ? Math.floor((Date.now()-ts)/864e5) : Infinity;
const money = v => (Math.round(v*10)/10).toLocaleString('en') + ' ' + S.set.cur;
const sortPieces = ps => [...ps].sort((a,b)=>ORDER.indexOf(a.cat)-ORDER.indexOf(b.cat));
const NOUN = {top:'قطعة علوية',bottom:'قطعة سفلية',full:'قطعة كاملة',outer:'جاكيت',shoes:'حذاء',bag:'شنطة',acc:'إكسسوار'};
const itemName = it => it.name || `${NOUN[it.cat]} · ${colorInfo(it.color).name}`;
function toast(m){ const t=$('toast'); t.textContent=m; t.classList.add('on'); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove('on'),2200); }
function busy(on,tx){ $('busy').classList.toggle('hidden',!on); if(tx) $('busyTx').textContent=tx; }
async function saveSet(){ await DB.put('kv',S.set,'settings'); }

/* ---------------- color science ---------------- */
const hexToRgb = h => [1,3,5].map(i=>parseInt(h.substr(i,2),16));
const rgbToHex = (r,g,b) => '#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
function rgbToHsl(r,g,b){ r/=255;g/=255;b/=255; const mx=Math.max(r,g,b),mn=Math.min(r,g,b); let h=0,s=0; const l=(mx+mn)/2;
  if(mx!==mn){ const d=mx-mn; s=l>.5?d/(2-mx-mn):d/(mx+mn); h=mx===r?((g-b)/d+(g<b?6:0)):mx===g?((b-r)/d+2):((r-g)/d+4); h*=60; }
  return [h,s,l]; }
const LIN = new Float32Array(256).map((_,v)=>{v/=255;return v>.04045?Math.pow((v+.055)/1.055,2.4):v/12.92});
function rgbToLab(r,g,b){
  r=LIN[r|0];g=LIN[g|0];b=LIN[b|0];
  let x=(r*.4124+g*.3576+b*.1805)/.95047, y=r*.2126+g*.7152+b*.0722, z=(r*.0193+g*.1192+b*.9505)/1.08883;
  const k=v=>v>.008856?Math.cbrt(v):7.787*v+16/116; x=k(x);y=k(y);z=k(z);
  return [116*y-16,500*(x-y),200*(y-z)]; }
const labDist = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const PAL = PALETTE.map(p=>({hex:p[0],name:p[1],neutral:!!p[2],lab:rgbToLab(...hexToRgb(p[0]))}));
const _ci = new Map();
function colorInfo(hex){
  if(_ci.has(hex)) return _ci.get(hex);
  const rgb=hexToRgb(hex), lab=rgbToLab(...rgb), [h,s,l]=rgbToHsl(...rgb);
  let best=PAL[0],bd=1e9; for(const p of PAL){ const d=labDist(lab,p.lab); if(d<bd){bd=d;best=p;} }
  const r={hex,h,s,l,name:best.name,family:best.hex,neutral:best.neutral||s<.14||l<.13||l>.92};
  _ci.set(hex,r); return r;
}
function harmony(a,b){
  if(a.neutral&&b.neutral) return {s:(a.name===b.name&&Math.abs(a.l-b.l)<.08)?1:2,k:'neutral'};
  if(a.neutral||b.neutral) return {s:2.2,k:'neutral'};
  let d=Math.abs(a.h-b.h); if(d>180) d=360-d; const dl=Math.abs(a.l-b.l);
  if(d<18) return {s:dl>.15?2.4:1.4,k:'mono'};
  if(d<50) return {s:1.6,k:'analog'};
  if(d>=150) return {s:(a.s>.6&&b.s>.6&&dl<.12)?.6:1.8,k:'comp'};
  if(d>=105&&d<=135) return {s:.6,k:'triad'};
  return {s:-1.6,k:'clash'};
}

/* ---------------- photo processing: background removal + color ---------------- */
function loadImg(src){ return new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=rej; im.src=src; }); }
function mkCanvas(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }

// Flood-fills the background from the photo border (works best on a plain surface),
// keeps the main garment, feathers the edge, and crops to the garment.
function processPhoto(im){
  const MAX=720, k=Math.min(1,MAX/Math.max(im.naturalWidth,im.naturalHeight));
  const w=Math.max(8,Math.round(im.naturalWidth*k)), h=Math.max(8,Math.round(im.naturalHeight*k)), N=w*h;
  const c=mkCanvas(w,h), x=c.getContext('2d',{willReadFrequently:true});
  x.drawImage(im,0,0,w,h);
  const orig=c.toDataURL('image/jpeg',.85);
  const id=x.getImageData(0,0,w,h), d=id.data;
  const L=new Float32Array(N),A=new Float32Array(N),B=new Float32Array(N);
  for(let i=0;i<N;i++){ const o=i*4, lab=rgbToLab(d[o],d[o+1],d[o+2]); L[i]=lab[0];A[i]=lab[1];B[i]=lab[2]; }
  const dist=(i,l,a,b)=>Math.hypot(L[i]-l,A[i]-a,B[i]-b);
  // background estimate from the border band
  const band=Math.max(2,Math.round(Math.min(w,h)*.015)), border=[];
  for(let y=0;y<h;y++) for(let xx=0;xx<w;xx++) if(xx<band||yy(y)||xx>=w-band) border.push(y*w+xx);
  function yy(y){ return y<band||y>=h-band; }
  let bl=0,ba=0,bb=0; for(const i of border){bl+=L[i];ba+=A[i];bb+=B[i];} bl/=border.length;ba/=border.length;bb/=border.length;
  let spread=0; for(const i of border) spread+=dist(i,bl,ba,bb); spread/=border.length;
  const T1=clamp(9+spread*1.5,12,32), T2=5, T3=T1*2.3;
  const bg=new Uint8Array(N), q=new Int32Array(N); let qh=0,qt=0;
  for(const i of border) if(!bg[i]&&dist(i,bl,ba,bb)<T3){ bg[i]=1; q[qt++]=i; }
  while(qh<qt){
    const i=q[qh++], px=i%w, py=(i/w)|0;
    const nb=[px>0?i-1:-1, px<w-1?i+1:-1, py>0?i-w:-1, py<h-1?i+w:-1];
    for(const j of nb){ if(j<0||bg[j]) continue;
      const dj=dist(j,bl,ba,bb);
      if(dj<T1 || (dj<T3 && Math.hypot(L[j]-L[i],A[j]-A[i],B[j]-B[i])<T2)){ bg[j]=1; q[qt++]=j; } }
  }
  // enclosed background pockets (bag handles, straps) that the border fill can't reach
  { const hole=new Uint8Array(N), T=T1*.8;
    for(let s0=0;s0<N;s0++){ if(bg[s0]||hole[s0]||dist(s0,bl,ba,bb)>=T) continue;
      qh=qt=0; q[qt++]=s0; hole[s0]=1;
      while(qh<qt){ const i=q[qh++], px=i%w, py=(i/w)|0;
        const nb=[px>0?i-1:-1, px<w-1?i+1:-1, py>0?i-w:-1, py<h-1?i+w:-1];
        for(const j of nb) if(j>=0&&!bg[j]&&!hole[j]&&dist(j,bl,ba,bb)<T){ hole[j]=1; q[qt++]=j; } }
      if(qt>N*.004) for(let k=0;k<qt;k++) bg[q[k]]=1; } }
  // keep only significant foreground components (removes specks and lint)
  const lab=new Int32Array(N); let nl=0; const sizes=[0];
  for(let s=0;s<N;s++){ if(bg[s]||lab[s]) continue; nl++; let n=0; qh=qt=0; q[qt++]=s; lab[s]=nl;
    while(qh<qt){ const i=q[qh++]; n++; const px=i%w, py=(i/w)|0;
      const nb=[px>0?i-1:-1, px<w-1?i+1:-1, py>0?i-w:-1, py<h-1?i+w:-1];
      for(const j of nb) if(j>=0&&!bg[j]&&!lab[j]){ lab[j]=nl; q[qt++]=j; } }
    sizes.push(n); }
  const big=sizes.reduce((m,n)=>n>m?n:m,0), keep=sizes.map(n=>n>=Math.max(big*.12,N*.002));
  let fg=0; for(let i=0;i<N;i++){ if(!bg[i]&&!keep[lab[i]]) bg[i]=1; if(!bg[i]) fg++; }
  const frac=fg/N;
  let cut=null, ar=h/w, cutAr=null;
  const colors=detectColors(d,w,h,frac>.04&&frac<.95?bg:null,[bl,ba,bb]);
  if(frac>.04 && frac<.95){
    // feathered alpha
    let a=new Float32Array(N); for(let i=0;i<N;i++) a[i]=bg[i]?0:255;
    for(let pass=0;pass<2;pass++){ const t=new Float32Array(N);
      for(let y=0;y<h;y++) for(let xx=0;xx<w;xx++){ const i=y*w+xx; t[i]=(a[i]+(xx>0?a[i-1]:a[i])+(xx<w-1?a[i+1]:a[i]))/3; }
      for(let y=0;y<h;y++) for(let xx=0;xx<w;xx++){ const i=y*w+xx; a[i]=(t[i]+(y>0?t[i-w]:t[i])+(y<h-1?t[i+w]:t[i]))/3; } }
    let x0=w,y0=h,x1=0,y1=0;
    for(let i=0;i<N;i++){ const v=clamp((a[i]-50)*1.4,0,255); d[i*4+3]=v; if(v>20){ const px=i%w,py=(i/w)|0; if(px<x0)x0=px; if(px>x1)x1=px; if(py<y0)y0=py; if(py>y1)y1=py; } }
    x.putImageData(id,0,0);
    const bw=x1-x0+1, bh=y1-y0+1, p=Math.round(Math.max(bw,bh)*.03);
    const kk=Math.min(1,640/Math.max(bw+2*p,bh+2*p));
    const cc=mkCanvas(Math.round((bw+2*p)*kk),Math.round((bh+2*p)*kk));
    cc.getContext('2d').drawImage(c,x0,y0,bw,bh,p*kk,p*kk,bw*kk,bh*kk);
    cut=cc.toDataURL('image/png'); cutAr=cc.height/cc.width;
  }
  return {orig,ar,cut,cutAr,...colors};
}
function detectColors(d,w,h,bgMask,bgLab){
  const N=w*h, step=Math.max(1,Math.floor(Math.sqrt(N/9000))), buckets=new Map(); let tot=0;
  for(let y=0;y<h;y+=step) for(let x=0;x<w;x+=step){
    const i=y*w+x, o=i*4;
    if(bgMask){ if(bgMask[i]) continue; }
    else { if(x<w*.18||x>w*.82||y<h*.18||y>h*.82) continue;
      if(labDist(rgbToLab(d[o],d[o+1],d[o+2]),bgLab)<16) continue; }
    const k=(d[o]>>5)*64+(d[o+1]>>5)*8+(d[o+2]>>5);
    const b=buckets.get(k)||{n:0,r:0,g:0,b:0}; b.n++; b.r+=d[o]; b.g+=d[o+1]; b.b+=d[o+2]; buckets.set(k,b); tot++;
  }
  const bs=[...buckets.values()].sort((a,b)=>b.n-a.n);
  if(!bs.length){ const o=((h>>1)*w+(w>>1))*4; return {color:rgbToHex(d[o],d[o+1],d[o+2]),color2:null}; }
  // merge near buckets into the leader
  const hexOf=b=>rgbToHex(b.r/b.n,b.g/b.n,b.b/b.n);
  const c1=hexOf(bs[0]), l1=rgbToLab(...hexToRgb(c1));
  let w1=0; for(const b of bs) if(labDist(rgbToLab(b.r/b.n,b.g/b.n,b.b/b.n),l1)<18) w1+=b.n;
  let color2=null;
  for(const b of bs){ const hx=hexOf(b); const lb=rgbToLab(...hexToRgb(hx)); if(labDist(lb,l1)<30) continue;
    let ww=0; for(const b2 of bs) if(labDist(rgbToLab(b2.r/b2.n,b2.g/b2.n,b2.b/b2.n),lb)<18) ww+=b2.n;
    if(ww>tot*.2) color2=hx; break; }
  return {color:c1,color2};
}

/* ---------------- sheet ---------------- */
let sheetClose=null;
function openSheet(html,onClose){ $('sheetBody').innerHTML=html; $('scrim').classList.add('on'); $('sheet').classList.add('on'); $('sheet').scrollTop=0; sheetClose=onClose||null; }
function closeSheet(){ $('scrim').classList.remove('on'); $('sheet').classList.remove('on'); const f=sheetClose; sheetClose=null; if(f) f(); }
$('scrim').onclick=closeSheet;
// swipe down on the grab handle to close
(()=>{ let y0=null; const sh=$('sheet');
  sh.addEventListener('touchstart',e=>{ y0=sh.scrollTop<=0?e.touches[0].clientY:null; },{passive:true});
  sh.addEventListener('touchend',e=>{ if(y0!==null&&e.changedTouches[0].clientY-y0>110&&sh.scrollTop<=0) closeSheet(); y0=null; },{passive:true});
})();

/* ---------------- outfit boards (collage) ---------------- */
function autoLayout(pieces){
  const has=c=>pieces.some(p=>p.cat===c), arOf=p=>p.ar||1.2, R=.75; // board w/h
  const L=[]; const add=(p,x,y,w,z)=>L.push({id:p.id,x,y,w,z});
  const g=c=>pieces.find(p=>p.cat===c);
  const outer=g('outer'), top=g('top'), bot=g('bottom'), full=g('full'), shoes=g('shoes'), bag=g('bag'), acc=g('acc');
  const fitW=(p,w,maxH)=>Math.min(w,maxH/(arOf(p)*R));
  let yEnd=.04;
  if(full){ const w=fitW(full,.5,.74); add(full,outer?.40:.25,.04,w,2); yEnd=.04+w*arOf(full)*R; }
  else {
    if(top){ const w=fitW(top,outer?.44:.5,.46); add(top,outer?.42:.25,.04,w,3); yEnd=.04+w*arOf(top)*R; }
    if(bot){ const y=Math.min(yEnd-.05,.42); const w=fitW(bot,.42,.94-y); add(bot,outer?.44:.29,Math.max(.3,y),w,1); }
  }
  if(outer){ const w=fitW(outer,.46,.56); add(outer,.03,.06,w,4); }
  if(shoes){ const w=fitW(shoes,.30,.2); add(shoes,.04,.95-w*arOf(shoes)*R,w,5); }
  if(bag){ const w=fitW(bag,.28,.26); add(bag,outer?.04:.03,outer?.62:.46,w,6); }
  if(acc){ const w=fitW(acc,.22,.2); add(acc,.74,.70,w,7); }
  // anything else (duplicates of a category) — tuck in the corner
  pieces.filter(p=>!L.some(l=>l.id===p.id)).forEach((p,i)=>add(p,.72,.05+i*.2,.2,8+i));
  return L;
}
function boardHTML(layout,cls=''){
  return `<div class="board ${cls}">${[...layout].sort((a,b)=>a.z-b.z).map(l=>{ const it=byId(l.id); if(!it) return '';
    return `<img src="${it.img}" class="${it.cut?'':'nocut'}" style="left:${(l.x*100).toFixed(2)}%;top:${(l.y*100).toFixed(2)}%;width:${(l.w*100).toFixed(2)}%" alt="">`; }).join('')}</div>`;
}
const layoutOf = o => (o.layout && o.layout.length ? o.layout.filter(l=>byId(l.id)) : autoLayout(o.ids.map(byId).filter(Boolean)));

/* ---------------- weather ---------------- */
function autoWxByMonth(dateStr){ const m=parseYmd(dateStr||today()).getMonth()+1; return [12,1,2].includes(m)?'cold':[3,4,10,11].includes(m)?'mild':'hot'; }
function wxDay(dateStr){ const w=S.wxInfo; return w&&w.days&&w.days[dateStr]; }
function wxFor(dateStr){ const d=wxDay(dateStr); if(!d) return autoWxByMonth(dateStr); const f=(d.max*2+d.min)/3; return f>=29?'hot':f>=19?'mild':'cold'; }
function wxIcon(code){ if(code==null) return '🌡️'; if(code===0) return '☀️'; if(code<=3) return '⛅'; if(code<=48) return '🌫️'; if(code<=67) return '🌧️'; if(code<=77) return '🌨️'; if(code<=82) return '🌦️'; return '⛈️'; }
async function fetchWeather(manual){
  if(!navigator.geolocation){ if(manual) toast('الموقع مو متاح'); return; }
  try{
    const pos=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:12000,maximumAge:3*3600e3}));
    const {latitude:la,longitude:lo}=pos.coords;
    const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la.toFixed(2)}&longitude=${lo.toFixed(2)}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=16`);
    const j=await r.json(); const info={at:Date.now(),temp:Math.round(j.current.temperature_2m),code:j.current.weather_code,days:{}};
    j.daily.time.forEach((t,i)=>info.days[t]={max:Math.round(j.daily.temperature_2m_max[i]),min:Math.round(j.daily.temperature_2m_min[i]),code:j.daily.weather_code[i]});
    S.wxInfo=info; await DB.put('kv',info,'wx'); S.set.wxOn=true; await saveSet();
    if(!S.wxManual){ S.wx=wxFor(S.planDate||today()); S.results=[]; }
    render(); if(manual) toast('تحدّث الجو ✓');
  }catch(e){ if(manual) toast('ما قدرت أجيب الجو — اسمح بالموقع'); }
}

/* ---------------- stylist engine ---------------- */
function fits(it,occ,wx){
  if(it.laundry) return false;
  if(it.occs&&it.occs.length&&occ&&!it.occs.includes(occ)) return false;
  const sea=(it.seasons||['all'])[0];
  if(wx==='hot'&&sea==='winter') return false;
  if(wx==='cold'&&sea==='summer'&&(it.cat==='outer'||it.cat==='shoes')) return false;
  return true;
}
function scoreOutfit(pieces,{occ,wx,bonus,ignoreRecent}){
  const core=pieces.filter(p=>['top','bottom','full','outer','shoes'].includes(p.cat));
  const cols=core.map(p=>colorInfo(p.color)); let s=0; const kinds={};
  for(let i=0;i<cols.length;i++) for(let j=i+1;j<cols.length;j++){
    const h=harmony(cols[i],cols[j]); const w=(core[i].cat==='shoes'||core[j].cat==='shoes')?.6:1; s+=h.s*w; kinds[h.k]=(kinds[h.k]||0)+1; }
  const loud=new Set(cols.filter(c=>!c.neutral).map(c=>c.name));
  if(loud.size>2) s-=2.5*(loud.size-2);
  if(loud.size===0) s+=(new Set(cols.map(c=>Math.round(c.l*4))).size>1)?.5:-.8;
  const t=pieces.find(p=>p.cat==='top'), b=pieces.find(p=>p.cat==='bottom');
  if(t&&b){ const ct=colorInfo(t.color),cb=colorInfo(b.color); if(Math.abs(ct.l-cb.l)<.06&&ct.name!==cb.name) s-=1; }
  for(const p of pieces){
    if(p.fav) s+=.4;
    if(!ignoreRecent){ const d=daysSince(p.lastWorn); if(d<3) s-=1.6; else if(d<7) s-=.6; }
    if(occ&&p.occs&&p.occs.includes(occ)) s+=.5;
    const sea=(p.seasons||['all'])[0]; if((wx==='cold'&&sea==='winter')||(wx==='hot'&&sea==='summer')) s+=.3;
    if(bonus&&bonus.has(p.id)) s+=1.4;
  }
  return {s, kinds, loud:[...loud]};
}
function generate(opt={}){
  const occ=opt.occ??S.occ, wx=opt.wx??S.wx, lockIds=opt.locks??S.locks, n=opt.n??6;
  const pool=c=>S.items.filter(i=>i.cat===c&&fits(i,occ,wx));
  const P={}; CATS.forEach(c=>P[c.id]=pool(c.id));
  const locked={}; for(const [c,id] of Object.entries(lockIds)){ const it=byId(id); if(it) locked[c]=it; }
  const canSplit=(locked.top||P.top.length)&&(locked.bottom||P.bottom.length), canFull=locked.full||P.full.length;
  if(!canSplit&&!canFull) return [];
  const recentKeys=new Set(Object.values(S.plans).filter(p=>p.worn&&daysSince(parseYmd(p.date).getTime())<10).map(p=>[...p.ids].sort().join('|')));
  const seen=new Map();
  for(let k=0;k<600;k++){
    let useFull = locked.full?true:(locked.top||locked.bottom)?false:
      (canFull&&(!canSplit||Math.random()<P.full.length/(P.full.length+Math.min(P.top.length,P.bottom.length)+1)));
    if(useFull&&!canFull) useFull=false; if(!useFull&&!canSplit) useFull=true;
    const ps=[];
    if(useFull) ps.push(locked.full||pick(P.full)); else { ps.push(locked.top||pick(P.top)); ps.push(locked.bottom||pick(P.bottom)); }
    const wantOuter=locked.outer||(P.outer.length&&(wx==='cold'||(wx==='mild'&&Math.random()<.35)));
    if(wantOuter) ps.push(locked.outer||pick(P.outer));
    if(locked.shoes||P.shoes.length) ps.push(locked.shoes||pick(P.shoes));
    if(locked.bag||(P.bag.length&&Math.random()<.7)) ps.push(locked.bag||pick(P.bag));
    if(locked.acc||(P.acc.length&&Math.random()<.6)) ps.push(locked.acc||pick(P.acc));
    const key=ps.map(p=>p.id).sort().join('|'); if(seen.has(key)) continue;
    const r=scoreOutfit(ps,{occ,wx,bonus:opt.bonus,ignoreRecent:opt.ignoreRecent});
    if(!opt.ignoreRecent&&recentKeys.has(key)) r.s-=3;
    if(opt.avoid&&opt.avoid.has(key)) r.s-=4;
    r.s+=Math.random()*.8; seen.set(key,{pieces:ps,key,...r});
  }
  const sorted=[...seen.values()].sort((a,b)=>b.s-a.s), out=[];
  for(const o of sorted){ if(out.length>=n) break;
    const overlap=out.some(x=>x.pieces.filter(p=>p.cat!=='shoes'&&o.pieces.some(q=>q.id===p.id)).length>=2);
    if(overlap&&sorted.length>n*3) continue; out.push(o); }
  return out.length?out:sorted.slice(0,n);
}
function explain(r,pieces){
  const k=r.kinds, parts=[];
  if(r.loud.length===0) parts.push('ألوان محايدة هادية — صعب تغلط فيها');
  else if(r.loud.length===1) parts.push(`لون واحد بارز (${r.loud[0]}) والباقي محايد يبرزه`);
  if(k.mono) parts.push('تدرّج من نفس اللون يعطي مظهر مرتب وطويل');
  if(k.analog) parts.push('ألوان متجاورة على عجلة الألوان، ناعمة ومتناسقة');
  if(k.comp) parts.push('ألوان متكاملة تعطي تباين حلو');
  if(k.clash) parts.push('فيه لونين جريئين مع بعض — إذا تحب المغامرة');
  if(pieces.some(p=>p.cat==='outer')) parts.push('أضفت طبقة خارجية عشان الجو');
  const fresh=pieces.filter(p=>!p.wears).length; if(fresh) parts.push(fresh===1?'فيه قطعة ما لبستها قبل':`فيه ${fresh} قطع ما لبستها قبل`);
  return parts.slice(0,3).join('. ')+'.';
}
const starsOf = s => '★'.repeat(clamp(Math.round(s/2.2),1,5)) + '☆'.repeat(5-clamp(Math.round(s/2.2),1,5));

/* ---------------- wear tracking (plans are the source of truth) ---------------- */
async function recomputeWear(){
  const w={}, last={};
  for(const p of Object.values(S.plans)) if(p.worn) for(const id of p.ids){ w[id]=(w[id]||0)+1; const t=parseYmd(p.date).getTime(); if(!last[id]||t>last[id]) last[id]=t; }
  const changed=[];
  for(const it of S.items){ const nw=w[it.id]||0, nl=last[it.id]||0; if(it.wears!==nw||it.lastWorn!==nl){ it.wears=nw; it.lastWorn=nl; changed.push(it); } }
  if(changed.length) await DB.putMany('items',changed);
}
async function setPlan(date,ids,layout,worn){
  const p={date,ids:[...ids],layout:layout||null,worn:!!worn};
  S.plans[date]=p; await DB.put('plans',p); await recomputeWear(); return p;
}
async function removePlan(date){ delete S.plans[date]; await DB.del('plans',date); await recomputeWear(); }
async function saveOutfit(ids,layout,extra={}){
  const key=[...ids].sort().join('|');
  let o=S.outfits.find(x=>x.key===key);
  if(o){ Object.assign(o,{layout:layout||o.layout},extra); }
  else { o={id:uid(),key,ids:[...ids],layout:layout||null,occ:S.occ,created:Date.now(),...extra}; S.outfits.push(o); }
  await DB.put('outfits',o); return o;
}

/* =====================================================================
   VIEWS
   ===================================================================== */
const TITLES = {
  closet:['خزانتي',()=>`${S.items.length} قطعة`],
  outfits:['أوتفتات',()=>S.oTab==='style'?'تنسيق ذكي حسب الجو والمناسبة':`${S.outfits.length} أوتفت محفوظ`],
  plan:['التقويم',()=>S.pTab==='cal'?'خطط لبسك وتابع وش لبست':'جهّز شنطة السفر'],
  stats:['إحصائيات',()=>'اعرف خزانتك أكثر'],
};
function render(){
  $('title').textContent=TITLES[S.view][0]; $('subtitle').textContent=TITLES[S.view][1]();
  ({closet:renderCloset,outfits:renderOutfits,plan:renderPlan,stats:renderStats})[S.view]();
}
function go(v){
  S.view=v; ['closet','outfits','plan','stats'].forEach(x=>$('v-'+x).classList.toggle('hidden',x!==v));
  document.querySelectorAll('nav .t').forEach(t=>t.classList.toggle('on',t.dataset.v===v));
  render(); window.scrollTo(0,0);
}
document.querySelectorAll('nav .t').forEach(t=>t.onclick=()=>go(t.dataset.v));

/* ---------------- closet ---------------- */
function closetList(){
  const C=S.closet, q=C.q.trim();
  let l=S.items.filter(i=>(C.cat==='all'||i.cat===C.cat)&&(!C.laundry||i.laundry)&&(!C.color||colorInfo(i.color).family===C.color));
  if(q) l=l.filter(i=>[i.name,i.brand,i.size,(i.tags||[]).join(' '),CAT[i.cat].ar,colorInfo(i.color).name,i.color2&&colorInfo(i.color2).name].join(' ').includes(q));
  const srt={new:(a,b)=>b.added-a.added,most:(a,b)=>(b.wears||0)-(a.wears||0),least:(a,b)=>(a.wears||0)-(b.wears||0)||(a.lastWorn||0)-(b.lastWorn||0),
    price:(a,b)=>(+b.price||0)-(+a.price||0),color:(a,b)=>colorInfo(a.color).h-colorInfo(b.color).h}[C.sort];
  return l.sort(srt);
}
function renderCloset(){
  const v=$('v-closet'), C=S.closet, items=S.items;
  const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent), standalone=navigator.standalone||matchMedia('(display-mode: standalone)').matches;
  const tip = isIOS&&!standalone&&!S.set.tipClosed ? `<div class="banner"><span>📲</span><span>ثبّته كتطبيق: زر <b>المشاركة</b> في سفاري ← <b>«إضافة إلى الشاشة الرئيسية»</b></span><button class="x" id="tipX">✕</button></div>` : '';
  if(!items.length){
    v.innerHTML=tip+`<div class="empty"><div class="big">🧺</div><h3>ابدأ بخزانتك</h3>
      <p class="hint">صوّر قطعة قطعة على خلفية سادة (سرير، أرضية، جدار).<br>التطبيق يشيل الخلفية لحاله ويعرف اللون.</p>
      <button class="btn primary" style="margin-top:14px" onclick="pickPhotos()">صوّر أول قطعة</button></div>`;
  } else {
    const count=c=>items.filter(i=>i.cat===c).length;
    const fams=[...new Set(items.map(i=>colorInfo(i.color).family))];
    const laundryN=items.filter(i=>i.laundry).length;
    const list=closetList();
    v.innerHTML=tip+`
      <div class="search">${IC.search}<input id="cq" type="search" placeholder="ابحث: اسم، ماركة، لون، تاق…" value="${esc(C.q)}">
        <select id="csort">${[['new','الأحدث'],['most','الأكثر لبس'],['least','الأقل لبس'],['price','السعر'],['color','اللون']].map(([k,t])=>`<option value="${k}" ${C.sort===k?'selected':''}>${t}</option>`).join('')}</select></div>
      <div class="chips" id="ccats"><button class="chip ${C.cat==='all'?'on':''}" data-v="all">الكل <span class="n">${items.length}</span></button>
        ${CATS.filter(c=>count(c.id)).map(c=>`<button class="chip ${C.cat===c.id?'on':''}" data-v="${c.id}">${c.e} ${c.ar} <span class="n">${count(c.id)}</span></button>`).join('')}</div>
      <div class="chips" id="ccols" style="margin-top:-4px">
        ${laundryN?`<button class="chip ${C.laundry?'on':''}" data-l="1">🧺 بالغسيل <span class="n">${laundryN}</span></button>`:''}
        ${fams.map(f=>`<button class="chip dotchip ${C.color===f?'on':''}" data-c="${f}" aria-label="${esc(colorInfo(f).name)}"><span class="sw" style="background:${f}"></span></button>`).join('')}</div>
      ${list.length?`<div class="grid" id="cgrid">${list.map(tileHTML).join('')}</div>`:`<div class="empty"><h3>ما فيه نتائج</h3><p class="hint">جرّب فلتر ثاني.</p></div>`}`;
    $('cq').oninput=e=>{ C.q=e.target.value; const l=closetList(); const g=$('cgrid'); if(g) g.innerHTML=l.map(tileHTML).join(''); else renderCloset(); };
    $('csort').onchange=e=>{ C.sort=e.target.value; renderCloset(); };
    $('ccats').onclick=e=>{ const b=e.target.closest('[data-v]'); if(!b) return; C.cat=b.dataset.v; renderCloset(); };
    $('ccols').onclick=e=>{ const b=e.target.closest('button'); if(!b) return;
      if(b.dataset.l) C.laundry=!C.laundry; else C.color=C.color===b.dataset.c?null:b.dataset.c; renderCloset(); };
    v.onclick=e=>{ const t=e.target.closest('.tile'); if(t) itemSheet(byId(t.dataset.id)); };
  }
  if($('tipX')) $('tipX').onclick=async()=>{ S.set.tipClosed=true; await saveSet(); renderCloset(); };
}
function tileHTML(i){
  return `<button class="tile ${i.laundry?'laundry':''}" data-id="${i.id}"><img src="${i.img}" class="${i.cut?'':'full'}" alt="" loading="lazy">
    <span class="dot" style="background:${i.color}"></span>
    <span class="badges">${i.fav?'<span>★</span>':''}${i.laundry?'<span>🧺</span>':''}${i.wears?`<span>${i.wears}×</span>`:''}</span></button>`;
}

/* add photos */
function pickPhotos(){ $('fileIn').value=''; $('fileIn').click(); }
$('addBtn').onclick=pickPhotos;
$('fileIn').addEventListener('change',async e=>{
  const files=[...e.target.files]; if(!files.length) return;
  const drafts=[];
  for(let n=0;n<files.length;n++){
    busy(true,files.length>1?`أجهّز الصور… ${n+1} / ${files.length}`:'أشيل الخلفية وأعرف اللون…');
    await new Promise(r=>setTimeout(r,30));
    const u=URL.createObjectURL(files[n]);
    try{ const im=await loadImg(u); const r=processPhoto(im);
      const ar=r.cut?r.cutAr:r.ar;
      const cat=S.closet.cat!=='all'?S.closet.cat:(ar<.75?'shoes':ar>1.45?'bottom':'top');
      drafts.push({id:uid(),_orig:r.orig,_origAr:r.ar,_cut:r.cut,_cutAr:r.cutAr,img:r.cut||r.orig,cut:!!r.cut,ar,cat,
        color:r.color,color2:r.color2,name:'',brand:'',price:'',size:'',tags:[],seasons:['all'],occs:[],fav:false,laundry:false,wears:0,lastWorn:0,added:Date.now()+n});
    }catch(err){ console.warn(err); }
    URL.revokeObjectURL(u);
  }
  busy(false);
  if(drafts.length) editItem(drafts,0,true); else toast('ما قدرت أقرأ الصورة');
});

/* item detail */
function itemSheet(it){
  const ci=colorInfo(it.color), cpw=+it.price&&it.wears?+it.price/it.wears:null;
  const inOutfits=S.outfits.filter(o=>o.ids.includes(it.id));
  openSheet(`
    <div class="preview"><img src="${it.img}" class="${it.cut?'':'full'}" alt=""></div>
    <div class="sheethead"><h2>${esc(itemName(it))}</h2>
      <button class="iconbtn" id="iFav" style="color:${it.fav?'var(--hi)':'inherit'}">${it.fav?IC.heartF:IC.heart}</button></div>
    <div class="hint" style="margin-top:-8px">${CAT[it.cat].e} ${CAT[it.cat].ar} · <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${it.color};vertical-align:-1px"></span> ${ci.name}${it.color2?` + ${colorInfo(it.color2).name}`:''}${it.brand?` · ${esc(it.brand)}`:''}${it.size?` · مقاس ${esc(it.size)}`:''}</div>
    ${(it.tags||[]).length?`<div class="tags">${it.tags.map(t=>`<span>#${esc(t)}</span>`).join('')}</div>`:''}
    <div class="kv">
      <div><b>${it.wears||0}</b><span>مرة لبستها</span></div>
      <div><b>${it.lastWorn?(daysSince(it.lastWorn)===0?'اليوم':daysSince(it.lastWorn)+' يوم'):'—'}</b><span>آخر لبسة</span></div>
      <div><b>${cpw!=null?money(cpw):(+it.price?money(+it.price):'—')}</b><span>${cpw!=null?'تكلفة اللبسة':'السعر'}</span></div>
    </div>
    ${inOutfits.length?`<div class="lbl">موجودة في ${inOutfits.length} أوتفت محفوظ</div>`:''}
    <div style="display:grid;gap:10px;margin-top:8px">
      <button class="btn primary" id="iStyle">✨ نسّق عليها</button>
      <div class="row"><button class="btn" id="iLaundry">${it.laundry?'✓ طلعت من الغسيل':'🧺 بالغسيل'}</button><button class="btn" id="iEdit">${IC.edit} تعديل</button></div>
      <button class="btn danger" id="iDel">${IC.trash} حذف القطعة</button>
    </div>`);
  $('iFav').onclick=async()=>{ it.fav=!it.fav; await DB.put('items',it); itemSheet(it); render(); };
  $('iLaundry').onclick=async()=>{ it.laundry=!it.laundry; await DB.put('items',it); S.results=[]; itemSheet(it); render(); toast(it.laundry?'حطيتها بالغسيل — ما بقترحها لين ترجع':'رجعت للخزانة ✓'); };
  $('iEdit').onclick=()=>editItem([{...it,tags:[...(it.tags||[])],occs:[...(it.occs||[])],seasons:[...(it.seasons||['all'])]}],0,false);
  $('iStyle').onclick=()=>{ closeSheet(); S.locks={[it.cat]:it.id}; S.results=[]; S.oTab='style'; go('outfits'); };
  $('iDel').onclick=async()=>{ if(!confirm('أكيد تبي تحذف القطعة؟')) return;
    await DB.del('items',it.id); S.items=S.items.filter(x=>x.id!==it.id);
    for(const o of S.outfits.filter(o=>o.ids.includes(it.id))){ o.ids=o.ids.filter(x=>x!==it.id); if(o.layout) o.layout=o.layout.filter(l=>l.id!==it.id);
      if(o.ids.length<2){ S.outfits=S.outfits.filter(x=>x!==o); await DB.del('outfits',o.id); } else await DB.put('outfits',o); }
    S.results=[]; closeSheet(); render(); toast('انحذفت'); };
}

/* item editor */
function editItem(list,i,isNew){
  const it=list[i]; const occSel=new Set(it.occs||[]);
  const sea=(it.seasons||['all'])[0];
  openSheet(`
    <h2>${isNew?'قطعة جديدة':'تعديل القطعة'}</h2>
    <div class="preview"><img id="ePrev" src="${it.img}" class="${it.cut?'':'full'}" alt="">${list.length>1?`<span class="count">${i+1} / ${list.length}</span>`:''}</div>
    ${isNew&&it._cut?`<div class="seg" id="eBg" style="margin-bottom:16px"><button class="${it.cut?'on':''}" data-v="1">✂️ بدون خلفية</button><button class="${it.cut?'':'on'}" data-v="0">🖼️ الصورة الأصلية</button></div>`:''}
    ${isNew&&!it._cut?`<p class="hint" style="margin:-2px 0 14px">ما قدرت أشيل الخلفية من هالصورة. صوّرها على خلفية سادة لنتيجة أحلى.</p>`:''}
    <div class="field"><label>النوع</label><div class="wrapchips" id="eCat">
      ${CATS.map(c=>`<button class="chip ${c.id===it.cat?'on':''}" data-v="${c.id}">${c.e} ${c.ar}</button>`).join('')}</div></div>
    <div class="field"><label>الاسم (اختياري)</label><input class="inp" id="eName" value="${esc(it.name)}" placeholder="${CAT[it.cat].ph}"></div>
    <div class="field"><label>اللون الأساسي — <span id="eCName">${colorInfo(it.color).name}</span></label>
      <div class="swatches" id="eCol"><button class="sw on" data-v="${it.color}" style="background:${it.color}"></button>
        ${PALETTE.map(p=>`<button class="sw" data-v="${p[0]}" style="background:${p[0]}" aria-label="${p[1]}"></button>`).join('')}</div>
      <div class="hint" style="margin-top:6px">أول دائرة اللون اللي اكتشفته${it.color2?` · لون ثاني: ${colorInfo(it.color2).name}`:''}</div></div>
    <div class="grid2">
      <div class="field"><label>الماركة</label><input class="inp" id="eBrand" value="${esc(it.brand)}" placeholder="—"></div>
      <div class="field"><label>المقاس</label><input class="inp" id="eSize" value="${esc(it.size)}" placeholder="—"></div>
    </div>
    <div class="field"><label>السعر (${S.set.cur}) — عشان أحسب تكلفة كل لبسة</label><input class="inp" id="ePrice" inputmode="decimal" value="${esc(it.price)}" placeholder="0"></div>
    <div class="field"><label>تنفع لـ (إذا ما اخترت = تنفع لكل شي)</label><div class="wrapchips" id="eOcc">
      ${OCCS.map(o=>`<button class="chip ${occSel.has(o.id)?'on':''}" data-v="${o.id}">${o.e} ${o.ar}</button>`).join('')}</div></div>
    <div class="field"><label>الموسم</label><div class="seg" id="eSea">${SEASONS.map(s=>`<button class="${sea===s.id?'on':''}" data-v="${s.id}">${s.ar}</button>`).join('')}</div></div>
    <div class="field"><label>تاقات (افصل بفاصلة)</label><input class="inp" id="eTags" value="${esc((it.tags||[]).join('، '))}" placeholder="مثلاً: كتان، رسمي، هدية"></div>
    <div class="row" style="margin-top:6px">
      ${isNew&&list.length>1?`<button class="btn ghost" id="eSkip">تخطي</button>`:''}
      <button class="btn primary" id="eSave">${isNew&&i<list.length-1?'حفظ والتالي':'حفظ'}</button>
    </div>`);
  const single=(box,fn)=>$(box).onclick=e=>{ const b=e.target.closest('[data-v]'); if(!b) return;
    $(box).querySelectorAll('[data-v]').forEach(x=>x.classList.toggle('on',x===b)); fn(b.dataset.v); };
  single('eCat',v=>{ it.cat=v; $('eName').placeholder=CAT[v].ph; });
  single('eCol',v=>{ it.color=v; $('eCName').textContent=colorInfo(v).name; });
  single('eSea',v=>{ it.seasons=[v]; });
  if($('eBg')) single('eBg',v=>{ it.cut=v==='1'; it.img=it.cut?it._cut:it._orig; it.ar=it.cut?it._cutAr:it._origAr; $('ePrev').src=it.img; $('ePrev').className=it.cut?'':'full'; });
  $('eOcc').onclick=e=>{ const b=e.target.closest('[data-v]'); if(!b) return; b.classList.toggle('on'); it.occs=[...$('eOcc').querySelectorAll('.on')].map(x=>x.dataset.v); };
  const next=()=>{ if(isNew&&i<list.length-1) editItem(list,i+1,true); else closeSheet(); };
  $('eSave').onclick=async()=>{
    it.name=$('eName').value.trim(); it.brand=$('eBrand').value.trim(); it.size=$('eSize').value.trim();
    it.price=$('ePrice').value.replace(/[^\d.]/g,''); it.tags=$('eTags').value.split(/[,،]/).map(s=>s.trim()).filter(Boolean);
    const rec={...it}; delete rec._orig; delete rec._cut; delete rec._origAr; delete rec._cutAr;
    await DB.put('items',rec); const k=S.items.findIndex(x=>x.id===rec.id); if(k<0) S.items.push(rec); else S.items[k]=rec;
    S.results=[]; render(); toast('انحفظت ✓'); next(); };
  if($('eSkip')) $('eSkip').onclick=next;
}

/* ---------------- outfits ---------------- */
function renderOutfits(){
  const v=$('v-outfits');
  v.innerHTML=`<div class="seg big" id="oSeg"><button class="${S.oTab==='style'?'on':''}" data-v="style">✨ نسّقلي</button><button class="${S.oTab==='saved'?'on':''}" data-v="saved">♡ المحفوظة</button></div><div id="oBody"></div>`;
  $('oSeg').onclick=e=>{ const b=e.target.closest('[data-v]'); if(!b) return; S.oTab=b.dataset.v; render(); };
  if(S.oTab==='style') renderStylist(); else renderSaved();
}
function wxBarHTML(){
  const date=S.planDate||today(), d=wxDay(date), w=WXM[S.wx];
  const isToday=date===today()&&S.wxInfo&&Date.now()-S.wxInfo.at<6*3600e3;
  const temp=isToday?S.wxInfo.temp:d?d.max:null, code=isToday?S.wxInfo.code:d?d.code:null;
  return `<div class="wxbar"><div class="tmp">${temp!=null?wxIcon(code):w.e}</div>
    <div class="d"><b>${temp!=null?temp+'°':w.ar}</b> ${d?`· ${d.min}°–${d.max}°`:''}<br>${temp!=null?(S.wxManual?'اخترت الجو يدوي':'الجو من موقعك'):'حسب الشهر — جيب الجو الحقيقي'}</div>
    <button class="btn" id="wxGet">${IC.pin} ${S.wxInfo?'تحديث':'موقعي'}</button></div>`;
}
function renderStylist(){
  const b=$('oBody');
  const has=c=>S.items.some(i=>i.cat===c&&!i.laundry);
  if(!((has('top')&&has('bottom'))||has('full'))){
    b.innerHTML=`<div class="empty"><div class="big">🪄</div><h3>أحتاج قطع أكثر</h3>
      <p class="hint">صوّر على الأقل قطعة <b>فوق</b> وقطعة <b>تحت</b> (أو <b>قطعة كاملة</b>) ويفضل حذاء — وأبدأ أنسّق لك.</p>
      <button class="btn primary" style="margin-top:12px" onclick="pickPhotos()">صوّر قطعة</button></div>`; return;
  }
  if(!S.wxManual) S.wx=wxFor(S.planDate||today());
  if(!S.results.length){ S.results=generate(); S.idx=0; }
  const o=S.results[S.idx];
  const head=`${S.planDate?`<div class="plannote">📅 تنسيق لـ ${fmtDate(S.planDate)}<button id="pnX">✕</button></div>`:''}
    ${wxBarHTML()}
    <div class="chips" id="occPick">${OCCS.map(x=>`<button class="chip ${S.occ===x.id?'on':''}" data-v="${x.id}">${x.e} ${x.ar}</button>`).join('')}</div>
    <div class="seg" id="wxPick" style="margin-bottom:14px">${WX.map(w=>`<button class="${S.wx===w.id?'on':''}" data-v="${w.id}">${w.e} ${w.ar}</button>`).join('')}</div>`;
  if(!o){ b.innerHTML=head+`<div class="empty"><div class="big">🤔</div><h3>ما لقيت تركيبة تناسب</h3><p class="hint">جرّب مناسبة أو جو ثاني، أو فك القفل.</p></div>`; bindStyleHead(); return; }
  const ps=sortPieces(o.pieces), saved=S.outfits.some(x=>x.key===o.key);
  b.innerHTML=head+`<div class="ocard">
      ${boardHTML(autoLayout(ps))}
      <div class="pieces" id="pcs">${ps.map(p=>`<div class="pc"><div class="im"><img src="${p.img}" alt=""></div>
        <button class="lk ${S.locks[p.cat]===p.id?'on':''}" data-cat="${p.cat}" data-id="${p.id}" aria-label="ثبّت">${S.locks[p.cat]===p.id?IC.lock:IC.unlock}</button></div>`).join('')}</div>
      <div class="meta"><div class="pal">${ps.map(p=>`<i style="background:${p.color}"></i>`).join('')}</div><span class="stars">${starsOf(o.s)}</span></div>
      <p class="why">${explain(o,ps)}</p>
      <div class="pager">${S.results.map((_,i)=>`<i class="${i===S.idx?'on':''}"></i>`).join('')}</div>
      <div class="row" style="margin-bottom:10px">
        <button class="btn sq" id="oFav" style="color:${saved?'var(--hi)':'inherit'}" aria-label="حفظ">${saved?IC.heartF:IC.heart}</button>
        <button class="btn sq" id="oEdit" aria-label="تعديل">${IC.edit}</button>
        ${S.planDate?'':`<button class="btn sq" id="oPlan" aria-label="خطط">${IC.cal}</button>`}
        <button class="btn" id="oNext">${IC.shuffle} غيره</button>
      </div>
      <button class="btn primary block" id="oWear">${S.planDate?`📅 اعتمده لـ ${fmtDate(S.planDate,{weekday:'long'})}`:'✓ بلبسه اليوم'}</button>
    </div>
    <p class="hint" style="text-align:center">🔒 ثبّت أي قطعة من الصور الصغيرة وأنسّق الباقي عليها</p>`;
  bindStyleHead();
  $('pcs').onclick=e=>{ const l=e.target.closest('[data-cat]'); if(!l) return; const c=l.dataset.cat;
    if(S.locks[c]===l.dataset.id) delete S.locks[c]; else { S.locks[c]=l.dataset.id;
      if(c==='full'){ delete S.locks.top; delete S.locks.bottom; } if(c==='top'||c==='bottom') delete S.locks.full; }
    renderStylist(); };
  $('oNext').onclick=()=>{ if(S.idx<S.results.length-1) S.idx++; else { S.results=generate(); S.idx=0; } renderStylist(); };
  $('oFav').onclick=async()=>{ const ex=S.outfits.find(x=>x.key===o.key);
    if(ex){ S.outfits=S.outfits.filter(x=>x!==ex); await DB.del('outfits',ex.id); toast('انشال من المحفوظة'); }
    else { await saveOutfit(o.pieces.map(p=>p.id),null,{occ:S.occ}); toast('انحفظ ♥'); } renderStylist(); };
  $('oEdit').onclick=()=>openBuilder({ids:o.pieces.map(p=>p.id),layout:autoLayout(ps),onSave:async(ids,layout)=>{ await saveOutfit(ids,layout,{occ:S.occ}); toast('انحفظ بالمحفوظة ♥'); }});
  if($('oPlan')) $('oPlan').onclick=()=>pickDateSheet(addDays(today(),1),async d=>{ await setPlan(d,o.pieces.map(p=>p.id),null,false); toast(`انضاف لـ ${fmtDate(d)} 📅`); });
  $('oWear').onclick=async()=>{
    const d=S.planDate||today(); await setPlan(d,o.pieces.map(p=>p.id),null,d===today()&&!S.planDate?true:d<=today());
    S.locks={}; S.results=[];
    if(S.planDate){ S.planDate=null; S.wxManual=false; toast('انضاف للتقويم 📅'); S.view='plan'; go('plan'); }
    else { toast('تمام ✓ سجلته بالتقويم'); renderStylist(); } };
}
function bindStyleHead(){
  $('occPick').onclick=e=>{ const b=e.target.closest('[data-v]'); if(!b) return; S.occ=b.dataset.v; S.results=[]; renderStylist(); };
  $('wxPick').onclick=e=>{ const b=e.target.closest('[data-v]'); if(!b) return; S.wx=b.dataset.v; S.wxManual=true; S.results=[]; renderStylist(); };
  $('wxGet').onclick=()=>{ S.wxManual=false; fetchWeather(true); };
  if($('pnX')) $('pnX').onclick=()=>{ S.planDate=null; S.wxManual=false; S.results=[]; renderStylist(); };
}
function renderSaved(){
  const b=$('oBody'); const list=[...S.outfits].filter(o=>o.ids.some(byId)).sort((a,b)=>b.created-a.created);
  b.innerHTML=`<div class="ogrid" id="sg">
      <button class="newcard" id="newO">${IC.plus}سوّ أوتفت بنفسك</button>
      ${list.map(o=>`<button class="oc" data-id="${o.id}">${boardHTML(layoutOf(o))}
        <div class="cap"><span>${o.name?esc(o.name):(OCC[o.occ]?OCC[o.occ].e+' '+OCC[o.occ].ar:'')}</span><span>${o.ids.length} قطع</span></div></button>`).join('')}
    </div>${list.length?'':'<p class="hint" style="text-align:center;margin-top:16px">احفظ أوتفتات من «نسّقلي» بزر ♡ أو ركّبها بنفسك.</p>'}`;
  $('newO').onclick=()=>openBuilder({onSave:async(ids,layout)=>{ await saveOutfit(ids,layout); toast('انحفظ ♥'); }});
  $('sg').onclick=e=>{ const c=e.target.closest('.oc'); if(c) outfitSheet(S.outfits.find(o=>o.id===c.dataset.id)); };
}
function outfitSheet(o){
  const lay=layoutOf(o); const worn=Object.values(S.plans).filter(p=>p.worn&&[...p.ids].sort().join('|')===o.key).length;
  openSheet(`<div class="sheethead"><h2>${o.name?esc(o.name):'أوتفت'}</h2><span class="hint">${worn?`لبسته ${worn} مرة`:'ما لبسته للحين'}</span></div>
    ${boardHTML(lay)}
    <div class="field" style="margin-top:14px"><label>اسم (اختياري)</label><input class="inp" id="oName" value="${esc(o.name||'')}" placeholder="مثلاً: عشاء الخميس"></div>
    <div style="display:grid;gap:10px">
      <button class="btn primary" id="sWear">✓ بلبسه اليوم</button>
      <div class="row"><button class="btn" id="sPlan">${IC.cal} خطط ليوم</button><button class="btn" id="sEdit">${IC.edit} عدّل</button></div>
      <button class="btn danger" id="sDel">${IC.trash} حذف</button></div>`,
    async()=>{ const n=$('oName')&&$('oName').value.trim(); if(n!==undefined&&n!==(o.name||'')){ o.name=n; await DB.put('outfits',o); render(); } });
  $('sWear').onclick=async()=>{ await setPlan(today(),o.ids,o.layout,true); closeSheet(); toast('تمام ✓ سجلته بالتقويم'); render(); };
  $('sPlan').onclick=()=>pickDateSheet(addDays(today(),1),async d=>{ await setPlan(d,o.ids,o.layout,d<today()); toast(`انضاف لـ ${fmtDate(d)} 📅`); });
  $('sEdit').onclick=()=>{ closeSheet(); openBuilder({ids:o.ids,layout:lay,onSave:async(ids,layout)=>{
      const key=[...ids].sort().join('|'); Object.assign(o,{ids,layout,key}); await DB.put('outfits',o); toast('انحفظ ✓'); }}); };
  $('sDel').onclick=async()=>{ if(!confirm('تحذف الأوتفت؟')) return; S.outfits=S.outfits.filter(x=>x!==o); await DB.del('outfits',o.id); closeSheet(); render(); };
}
function pickDateSheet(def,cb){
  openSheet(`<h2>أي يوم؟</h2><input type="date" class="inp" id="pd" value="${def}" style="margin-bottom:16px">
    <div class="chips">${[0,1,2,3,4,5,6].map(n=>{ const d=addDays(today(),n); return `<button class="chip" data-d="${d}">${n===0?'اليوم':n===1?'بكرة':fmtDate(d,{weekday:'long'})}</button>`; }).join('')}</div>
    <button class="btn primary block" id="pdOk">تم</button>`);
  const done=async d=>{ if(!d) return; closeSheet(); await cb(d); render(); };
  $('sheetBody').querySelector('.chips').onclick=e=>{ const b=e.target.closest('[data-d]'); if(b) done(b.dataset.d); };
  $('pdOk').onclick=()=>done($('pd').value);
}

/* ---------------- builder (drag & drop collage) ---------------- */
const B={layout:[],sel:null,cat:'all',onSave:null};
function openBuilder({ids=[],layout=null,onSave,title='سوّ أوتفت'}){
  B.layout=(layout||autoLayout(ids.map(byId).filter(Boolean))).map(l=>({...l})); B.sel=null; B.onSave=onSave; B.cat='all';
  $('bTitle').textContent=title; $('builder').classList.add('on'); bRender(); bTray();
}
function bClose(){ $('builder').classList.remove('on'); }
$('bCancel').onclick=bClose;
$('bSave').onclick=async()=>{
  if(B.layout.length<2){ toast('أضف قطعتين على الأقل'); return; }
  const ids=B.layout.map(l=>l.id); await B.onSave(ids,B.layout.map(l=>({...l}))); bClose(); render(); };
function bRender(){
  const bd=$('bBoard');
  bd.innerHTML=(B.layout.length?'':'<div class="hint2">اختر قطع من تحت 👇<br>اسحبها لترتيبها، وكبّرها أو صغّرها بإصبعين</div>')+
    [...B.layout].sort((a,b)=>a.z-b.z).map(l=>{ const it=byId(l.id); return `<div class="it ${B.sel===l.id?'sel':''}" data-id="${l.id}"
      style="left:${l.x*100}%;top:${l.y*100}%;width:${l.w*100}%;z-index:${l.z}"><img src="${it.img}" class="${it.cut?'':'nocut'}" alt=""></div>`; }).join('');
  $('bTools').innerHTML=B.sel?`<button data-a="del" aria-label="شيل">${IC.trash}</button><button data-a="up" aria-label="قدّام">${IC.up}</button>
    <button data-a="down" aria-label="ورا">${IC.down}</button><button data-a="big" aria-label="كبّر">${IC.big}</button><button data-a="small" aria-label="صغّر">${IC.small}</button>`:
    `<span class="hint" style="align-self:center">اضغط على قطعة عشان تعدّلها</span>`;
}
function bTray(){
  const cats=CATS.filter(c=>S.items.some(i=>i.cat===c.id));
  $('bCats').innerHTML=`<button class="chip ${B.cat==='all'?'on':''}" data-v="all">الكل</button>`+cats.map(c=>`<button class="chip ${B.cat===c.id?'on':''}" data-v="${c.id}">${c.e} ${c.ar}</button>`).join('');
  const list=S.items.filter(i=>B.cat==='all'||i.cat===B.cat).sort((a,b)=>ORDER.indexOf(a.cat)-ORDER.indexOf(b.cat));
  $('bTray').innerHTML=list.map(i=>`<button class="ti ${B.layout.some(l=>l.id===i.id)?'in':''}" data-id="${i.id}"><img src="${i.img}" alt=""></button>`).join('');
}
$('bCats').onclick=e=>{ const b=e.target.closest('[data-v]'); if(!b) return; B.cat=b.dataset.v; bTray(); };
$('bTray').onclick=e=>{ const b=e.target.closest('[data-id]'); if(!b) return; const id=b.dataset.id;
  if(B.layout.some(l=>l.id===id)){ B.layout=B.layout.filter(l=>l.id!==id); if(B.sel===id) B.sel=null; }
  else { const it=byId(id); const tmp=autoLayout([...B.layout.map(l=>byId(l.id)).filter(Boolean),it]).find(l=>l.id===id);
    const z=Math.max(0,...B.layout.map(l=>l.z))+1; B.layout.push({...tmp,z}); B.sel=id; }
  bRender(); bTray(); };
$('bTools').onclick=e=>{ const b=e.target.closest('[data-a]'); if(!b||!B.sel) return; const l=B.layout.find(x=>x.id===B.sel); const a=b.dataset.a;
  if(a==='del'){ B.layout=B.layout.filter(x=>x!==l); B.sel=null; bTray(); }
  if(a==='up') l.z=Math.max(...B.layout.map(x=>x.z))+1;
  if(a==='down'){ B.layout.forEach(x=>x.z++); l.z=0; }
  if(a==='big') l.w=clamp(l.w*1.12,.08,1); if(a==='small') l.w=clamp(l.w/1.12,.08,1);
  bRender(); };
(()=>{ // pointer: drag with one finger, pinch with two
  const bd=$('bBoard'), pts=new Map(); let drag=null, pinch=null;
  bd.addEventListener('pointerdown',e=>{
    const t=e.target.closest('.it'); pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===1){ if(!t){ B.sel=null; bRender(); return; }
      B.sel=t.dataset.id; const l=B.layout.find(x=>x.id===B.sel);
      drag={l,x0:e.clientX,y0:e.clientY,lx:l.x,ly:l.y}; bd.setPointerCapture(e.pointerId);
      bd.querySelectorAll('.it').forEach(n=>n.classList.toggle('sel',n.dataset.id===B.sel)); bRenderTools(); }
    else if(pts.size===2&&B.sel){ const [a,b]=[...pts.values()]; const l=B.layout.find(x=>x.id===B.sel);
      pinch={l,d0:Math.hypot(a.x-b.x,a.y-b.y),w0:l.w}; drag=null; }
  });
  bd.addEventListener('pointermove',e=>{ if(!pts.has(e.pointerId)) return; pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    const r=bd.getBoundingClientRect();
    if(pinch&&pts.size>=2){ const [a,b]=[...pts.values()]; pinch.l.w=clamp(pinch.w0*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d0,.08,1); moveEl(pinch.l); }
    else if(drag){ drag.l.x=clamp(drag.lx+(e.clientX-drag.x0)/r.width,-.3,.95); drag.l.y=clamp(drag.ly+(e.clientY-drag.y0)/r.height,-.3,.95); moveEl(drag.l); }
  });
  const up=e=>{ pts.delete(e.pointerId); if(pts.size<2) pinch=null; if(!pts.size) drag=null; };
  bd.addEventListener('pointerup',up); bd.addEventListener('pointercancel',up);
  function moveEl(l){ const n=bd.querySelector(`.it[data-id="${l.id}"]`); if(n){ n.style.left=l.x*100+'%'; n.style.top=l.y*100+'%'; n.style.width=l.w*100+'%'; } }
  function bRenderTools(){ const keep=B.layout; bRender(); B.layout=keep; }
})();

/* ---------------- calendar & trips ---------------- */
function renderPlan(){
  const v=$('v-plan');
  v.innerHTML=`<div class="seg big" id="pSeg"><button class="${S.pTab==='cal'?'on':''}" data-v="cal">📅 التقويم</button><button class="${S.pTab==='trips'?'on':''}" data-v="trips">✈️ السفرات</button></div><div id="pBody"></div>`;
  $('pSeg').onclick=e=>{ const b=e.target.closest('[data-v]'); if(!b) return; S.pTab=b.dataset.v; render(); };
  if(S.pTab==='cal') renderCal(); else renderTrips();
}
function renderCal(){
  const {y,m}=S.cal, first=new Date(y,m,1,12), startDow=first.getDay(), dim=new Date(y,m+1,0).getDate(), td=today();
  const cells=[]; for(let i=0;i<startDow;i++) cells.push(null); for(let d=1;d<=dim;d++) cells.push(`${y}-${pad2(m+1)}-${pad2(d)}`);
  while(cells.length%7) cells.push(null);
  const wd=['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
  const monthWorn=Object.values(S.plans).filter(p=>p.worn&&p.date.startsWith(`${y}-${pad2(m+1)}`)).length;
  const tp=S.plans[td];
  $('pBody').innerHTML=`
    <div class="calhead"><button id="cPrev">${IC.prev}</button><h3>${first.toLocaleDateString(LOC,{month:'long',year:'numeric'})}</h3><button id="cNext">${IC.next}</button></div>
    <div class="cal" id="calg">${wd.map(w=>`<div class="wd">${w}</div>`).join('')}
      ${cells.map(c=>{ if(!c) return '<div class="d out"></div>'; const p=S.plans[c];
        return `<button class="d ${c===td?'today':''}" data-d="${c}"><span class="n">${+c.slice(8)}</span>${p?boardHTML(p.layout||autoLayout(p.ids.map(byId).filter(Boolean))):''}${p&&p.worn?'<span class="ok">✓</span>':''}</button>`; }).join('')}</div>
    <p class="hint" style="text-align:center;margin-top:10px">لبست ${monthWorn} أوتفت هالشهر</p>
    <div class="todaycard">${tp?boardHTML(tp.layout||autoLayout(tp.ids.map(byId).filter(Boolean))):'<div class="board" style="display:grid;place-items:center;font-size:30px">✨</div>'}
      <div class="tx"><h4>اليوم</h4><p class="hint" style="margin:0 0 10px">${tp?(tp.worn?'سجلت لبسة اليوم ✓':'مخطط له — أكّد إذا لبسته'):'ما حددت وش بتلبس'}</p>
      <button class="btn primary" id="todayBtn" style="padding:10px 16px">${tp?'افتح':'نسّقلي'}</button></div></div>`;
  $('cPrev').onclick=()=>{ S.cal.m--; if(S.cal.m<0){S.cal.m=11;S.cal.y--;} renderCal(); };
  $('cNext').onclick=()=>{ S.cal.m++; if(S.cal.m>11){S.cal.m=0;S.cal.y++;} renderCal(); };
  $('calg').onclick=e=>{ const b=e.target.closest('[data-d]'); if(b) daySheet(b.dataset.d); };
  $('todayBtn').onclick=()=>tp?daySheet(td):styleFor(td);
}
function styleFor(date){ S.planDate=date===today()?null:date; S.wxManual=false; S.results=[]; S.locks={}; S.oTab='style'; go('outfits'); }
function daySheet(date){
  const p=S.plans[date], future=date>today();
  if(!p){
    openSheet(`<h2>${fmtDate(date)}</h2><p class="hint" style="margin-top:-8px;margin-bottom:16px">${wxDay(date)?`${wxIcon(wxDay(date).code)} ${wxDay(date).min}°–${wxDay(date).max}°`:''}</p>
      <div style="display:grid;gap:10px">
        <button class="btn primary" id="dStyle">✨ نسّقلي لهاليوم</button>
        <button class="btn" id="dSaved">♡ اختر من المحفوظة</button>
        <button class="btn" id="dBuild">${IC.edit} ركّبه بنفسي</button></div>`);
    $('dStyle').onclick=()=>{ closeSheet(); styleFor(date); };
    $('dBuild').onclick=()=>{ closeSheet(); openBuilder({title:fmtDate(date,{day:'numeric',month:'long'}),onSave:async(ids,layout)=>{ await setPlan(date,ids,layout,!future); toast('انضاف ✓'); }}); };
    $('dSaved').onclick=()=>{
      const list=S.outfits.filter(o=>o.ids.some(byId));
      openSheet(`<h2>اختر أوتفت</h2>${list.length?`<div class="ogrid" id="pickO">${list.map(o=>`<button class="oc" data-id="${o.id}">${boardHTML(layoutOf(o))}</button>`).join('')}</div>`:'<p class="hint">ما عندك أوتفتات محفوظة.</p>'}`);
      if($('pickO')) $('pickO').onclick=async e=>{ const c=e.target.closest('.oc'); if(!c) return; const o=S.outfits.find(x=>x.id===c.dataset.id);
        await setPlan(date,o.ids,o.layout,!future); closeSheet(); render(); toast('انضاف ✓'); }; };
    return;
  }
  const lay=p.layout||autoLayout(p.ids.map(byId).filter(Boolean));
  openSheet(`<div class="sheethead"><h2>${fmtDate(date)}</h2></div>${boardHTML(lay)}
    <div style="display:grid;gap:10px;margin-top:14px">
      ${future?'':`<button class="btn ${p.worn?'':'primary'}" id="dWorn">${p.worn?'✓ لبسته (اضغط للإلغاء)':'✓ أكّد إني لبسته'}</button>`}
      <div class="row"><button class="btn" id="dSave">${IC.heart} احفظه</button><button class="btn" id="dEdit">${IC.edit} عدّل</button></div>
      <button class="btn danger" id="dDel">${IC.trash} شيله من اليوم</button></div>`);
  if($('dWorn')) $('dWorn').onclick=async()=>{ await setPlan(date,p.ids,p.layout,!p.worn); closeSheet(); render(); };
  $('dSave').onclick=async()=>{ await saveOutfit(p.ids,lay); toast('انحفظ ♥'); };
  $('dEdit').onclick=()=>{ closeSheet(); openBuilder({ids:p.ids,layout:lay,title:fmtDate(date,{day:'numeric',month:'long'}),onSave:async(ids,layout)=>{ await setPlan(date,ids,layout,p.worn); }}); };
  $('dDel').onclick=async()=>{ await removePlan(date); closeSheet(); render(); };
}

function renderTrips(){
  const list=[...S.trips].sort((a,b)=>a.from<b.from?1:-1);
  $('pBody').innerHTML=`<button class="btn primary block" id="newTrip" style="margin-bottom:14px">${IC.plus} سفرة جديدة</button>
    ${list.map(t=>{ const ids=tripItems(t), done=ids.filter(id=>t.packed[id]).length;
      return `<button class="trip" data-id="${t.id}"><h4>✈️ ${esc(t.name)}</h4>
        <div class="sm">${fmtDate(t.from,{day:'numeric',month:'short'})} ← ${fmtDate(t.to,{day:'numeric',month:'short'})} · ${t.days.length} أيام · ${WXM[t.wx].e} ${WXM[t.wx].ar}</div>
        <div class="sm">${ids.length} قطعة للشنطة · جهزت ${done}</div><div class="bar"><i style="width:${ids.length?done/ids.length*100:0}%"></i></div></button>`; }).join('')}
    ${list.length?'':`<div class="empty"><div class="big">🧳</div><h3>مسافر قريب؟</h3><p class="hint">قلّي كم يوم ووين، وأطلع لك أوتفت لكل يوم بأقل عدد قطع — وقائمة شنطة تأشّر عليها.</p></div>`}`;
  $('newTrip').onclick=newTripSheet;
  $('pBody').onclick=e=>{ const c=e.target.closest('.trip'); if(c) tripSheet(S.trips.find(t=>t.id===c.dataset.id)); };
}
const tripItems = t => [...new Set(t.days.flatMap(d=>d.ids))].filter(byId);
function newTripSheet(){
  const f=addDays(today(),7), occSel=new Set(['casual','out']);
  let wx=S.wxInfo?wxFor(f):autoWxByMonth(f);
  openSheet(`<h2>سفرة جديدة</h2>
    <div class="field"><label>وين؟</label><input class="inp" id="tName" placeholder="مثلاً: دبي، لندن، العلا"></div>
    <div class="grid2"><div class="field"><label>من</label><input type="date" class="inp" id="tFrom" value="${f}"></div>
      <div class="field"><label>إلى</label><input type="date" class="inp" id="tTo" value="${addDays(f,3)}"></div></div>
    <div class="field"><label>الجو هناك</label><div class="seg" id="tWx">${WX.map(w=>`<button class="${wx===w.id?'on':''}" data-v="${w.id}">${w.e} ${w.ar}</button>`).join('')}</div></div>
    <div class="field"><label>وش البرنامج؟</label><div class="wrapchips" id="tOcc">${OCCS.map(o=>`<button class="chip ${occSel.has(o.id)?'on':''}" data-v="${o.id}">${o.e} ${o.ar}</button>`).join('')}</div></div>
    <button class="btn primary block" id="tGo">✨ جهّز لي الشنطة</button>`);
  $('tWx').onclick=e=>{ const b=e.target.closest('[data-v]'); if(!b) return; wx=b.dataset.v; $('tWx').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); };
  $('tOcc').onclick=e=>{ const b=e.target.closest('[data-v]'); if(!b) return; b.classList.toggle('on'); };
  $('tGo').onclick=async()=>{
    const name=$('tName').value.trim()||'سفرة', from=$('tFrom').value, to=$('tTo').value;
    if(!from||!to||to<from){ toast('تأكد من التواريخ'); return; }
    const occs=[...$('tOcc').querySelectorAll('.on')].map(x=>x.dataset.v); if(!occs.length) occs.push('casual');
    const t={id:uid(),name,from,to,wx,occs,days:[],packed:{},created:Date.now()};
    planTrip(t);
    if(!t.days.length){ toast('أحتاج قطع أكثر عشان أجهّز السفرة'); return; }
    S.trips.push(t); await DB.put('trips',t); closeSheet(); renderTrips(); tripSheet(t); };
}
function planTrip(t){
  let n=Math.round((parseYmd(t.to)-parseYmd(t.from))/864e5)+1; n=clamp(n,1,21);
  const chosen=new Set(), keys=new Set(); t.days=[];
  for(let i=0;i<n;i++){
    const occ=t.occs[i%t.occs.length];
    const r=generate({occ,wx:t.wx,locks:{},n:1,bonus:chosen,avoid:keys,ignoreRecent:true})[0]
      || generate({occ:null,wx:t.wx,locks:{},n:1,bonus:chosen,avoid:keys,ignoreRecent:true})[0];
    if(!r) break;
    r.pieces.forEach(p=>chosen.add(p.id)); keys.add(r.key);
    t.days.push({date:addDays(t.from,i),occ,ids:r.pieces.map(p=>p.id)});
  }
}
function tripSheet(t){
  const ids=tripItems(t), groups=CATS.map(c=>({c,items:ids.map(byId).filter(i=>i.cat===c.id)})).filter(g=>g.items.length);
  const done=ids.filter(id=>t.packed[id]).length;
  openSheet(`<div class="sheethead"><h2>✈️ ${esc(t.name)}</h2><span class="hint">${done}/${ids.length}</span></div>
    <div class="bar" style="margin:-4px 0 16px"><i style="width:${ids.length?done/ids.length*100:0}%"></i></div>
    <div class="secthead" style="margin-top:0"><h3>🧳 الشنطة</h3><small>${ids.length} قطعة لـ ${t.days.length} أوتفت</small></div>
    <div id="tPack">${groups.map(g=>`<div class="lbl" style="margin-top:10px">${g.c.e} ${g.c.ar}</div>${g.items.map(i=>`
      <button class="pack ${t.packed[i.id]?'done':''}" data-id="${i.id}"><span class="im"><img src="${i.img}" alt=""></span><span class="nm">${esc(itemName(i))}</span><span class="ck">${t.packed[i.id]?'✓':''}</span></button>`).join('')}`).join('')}</div>
    <div class="secthead"><h3>👗 أوتفت كل يوم</h3><small>اضغط 🔀 للتغيير</small></div>
    <div class="dayrow" id="tDays">${t.days.map((d,k)=>`<div class="dc">${boardHTML(autoLayout(d.ids.map(byId).filter(Boolean)))}
      <div class="cap"><span>${fmtDate(d.date,{weekday:'short',day:'numeric'})} ${OCC[d.occ]?OCC[d.occ].e:''}</span><button data-k="${k}" aria-label="غيّر">🔀</button></div></div>`).join('')}</div>
    <div style="display:grid;gap:10px;margin-top:16px">
      <button class="btn primary" id="tCal">${IC.cal} أضف الأوتفتات للتقويم</button>
      <div class="row"><button class="btn" id="tRe">${IC.shuffle} رتّبها من جديد</button><button class="btn danger" id="tDel">${IC.trash} حذف</button></div></div>`);
  $('tPack').onclick=async e=>{ const b=e.target.closest('[data-id]'); if(!b) return; t.packed[b.dataset.id]=!t.packed[b.dataset.id]; await DB.put('trips',t); tripSheet(t); renderTrips(); };
  $('tDays').onclick=async e=>{ const b=e.target.closest('[data-k]'); if(!b) return; const k=+b.dataset.k, d=t.days[k];
    const others=new Set(t.days.filter((_,j)=>j!==k).flatMap(x=>x.ids)), keys=new Set(t.days.map(x=>[...x.ids].sort().join('|')));
    const r=generate({occ:d.occ,wx:t.wx,locks:{},n:3,bonus:others,avoid:keys,ignoreRecent:true}); if(!r.length) return;
    d.ids=pick(r).pieces.map(p=>p.id); await DB.put('trips',t); tripSheet(t); };
  $('tCal').onclick=async()=>{ for(const d of t.days) if(!S.plans[d.date]) await setPlan(d.date,d.ids,null,false); toast('انضافت للتقويم 📅'); };
  $('tRe').onclick=async()=>{ planTrip(t); t.packed={}; await DB.put('trips',t); tripSheet(t); renderTrips(); };
  $('tDel').onclick=async()=>{ if(!confirm('تحذف السفرة؟')) return; S.trips=S.trips.filter(x=>x!==t); await DB.del('trips',t.id); closeSheet(); renderTrips(); };
}

/* ---------------- stats ---------------- */
function renderStats(){
  const v=$('v-stats'), its=S.items;
  if(!its.length){ v.innerHTML=`<div class="empty"><div class="big">📊</div><h3>ما فيه بيانات للحين</h3><p class="hint">أضف ملابسك وسجّل وش تلبس، وأوريك إحصائيات خزانتك.</p></div>`; return; }
  const priced=its.filter(i=>+i.price>0), value=priced.reduce((s,i)=>s+ +i.price,0);
  const pw=priced.filter(i=>i.wears>0), cpw=pw.length?pw.reduce((s,i)=>s+ +i.price,0)/pw.reduce((s,i)=>s+i.wears,0):null;
  const used90=its.filter(i=>daysSince(i.lastWorn)<=90).length, usage=Math.round(used90/its.length*100);
  const wornPlans=Object.values(S.plans).filter(p=>p.worn);
  const catN=CATS.map(c=>({c,n:its.filter(i=>i.cat===c.id).length})).filter(x=>x.n), maxC=Math.max(...catN.map(x=>x.n));
  const fam={}; its.forEach(i=>{ const f=colorInfo(i.color).family; fam[f]=(fam[f]||0)+1; });
  const fams=Object.entries(fam).sort((a,b)=>b[1]-a[1]);
  const most=[...its].filter(i=>i.wears).sort((a,b)=>b.wears-a.wears).slice(0,8);
  const forgotten=its.filter(i=>!i.laundry&&((!i.wears&&daysSince(i.added)>=14)||(i.wears&&daysSince(i.lastWorn)>60))).slice(0,10);
  const neverN=its.filter(i=>!i.wears).length;
  const bestVal=pw.map(i=>({i,c:+i.price/i.wears})).sort((a,b)=>a.c-b.c).slice(0,5);
  const strip=(arr,lab)=>`<div class="hlist">${arr.map(x=>{ const i=x.i||x; return `<button class="h" data-id="${i.id}"><div class="im"><img src="${i.img}" alt=""></div>${lab(x)}</button>`; }).join('')}</div>`;
  v.innerHTML=`
    <div class="cards">
      <div class="card"><b>${its.length}</b><span>قطعة بالخزانة</span></div>
      <div class="card"><b>${usage}%</b><span>استخدمتها آخر ٣ شهور</span></div>
      <div class="card"><b>${value?money(value):'—'}</b><span>قيمة الخزانة${priced.length<its.length?` (${priced.length} مسعّرة)`:''}</span></div>
      <div class="card"><b>${cpw!=null?money(cpw):'—'}</b><span>متوسط تكلفة اللبسة</span></div>
    </div>
    ${most.length?`<div class="secthead"><h3>🔥 الأكثر لبس</h3><small>${wornPlans.length} لبسة مسجلة</small></div>${strip(most,i=>`${i.wears} مرة`)}`:''}
    ${forgotten.length?`<div class="secthead"><h3>💤 منسية</h3><small>${neverN} قطعة ما انلبست أبد</small></div>
      <p class="hint" style="margin:-4px 2px 10px">اضغط عليها وخلني أنسّق عليها — أو فكّر تتبرع فيها.</p>${strip(forgotten,i=>i.wears?`قبل ${daysSince(i.lastWorn)} يوم`:'ما انلبست')}`:''}
    ${bestVal.length?`<div class="secthead"><h3>💰 أفضل قيمة</h3><small>أقل تكلفة لكل لبسة</small></div>${strip(bestVal,x=>money(x.c))}`:''}
    <div class="secthead"><h3>🎨 ألوانك</h3></div>
    <div class="panel"><div class="stack">${fams.map(([f,n])=>`<span style="flex:${n};background:${f}"></span>`).join('')}</div>
      <div class="legend">${fams.map(([f,n])=>`<span><i style="background:${f}"></i>${colorInfo(f).name} ${Math.round(n/its.length*100)}%</span>`).join('')}</div></div>
    <div class="panel"><h4>👚 التوزيع</h4>${catN.map(x=>`<div class="hbar"><span class="l">${x.c.e} ${x.c.ar}</span><span class="t"><i style="width:${x.n/maxC*100}%"></i></span><span class="v">${x.n}</span></div>`).join('')}
      ${insight(catN)}</div>`;
  v.onclick=e=>{ const h=e.target.closest('.h'); if(h) itemSheet(byId(h.dataset.id)); };
}
function insight(catN){
  const n=c=>(catN.find(x=>x.c.id===c)||{n:0}).n;
  const t=n('top'), b=n('bottom'), s=n('shoes');
  let tip='';
  if(t&&b&&t/b>3) tip='عندك قطع فوق أكثر بكثير من تحت — بنطلون محايد واحد يفتح لك تركيبات كثيرة.';
  else if(t&&b&&b/t>2) tip='قطع تحت أكثر من فوق — تيشيرت أو قميص محايد بيضاعف أوتفتاتك.';
  else if(!s) tip='أضف أحذيتك عشان تكتمل الأوتفتات.';
  else if(t&&b) tip=`عندك ${t*b+n('full')} تركيبة أساسية ممكنة 👌`;
  return tip?`<p class="hint" style="margin:10px 0 0">💡 ${tip}</p>`:'';
}

/* ---------------- settings ---------------- */
$('settingsBtn').onclick=()=>{
  openSheet(`<h2>الإعدادات</h2>
    <div class="field"><label>العملة</label><div class="wrapchips" id="sCur">${CURS.map(c=>`<button class="chip ${S.set.cur===c?'on':''}" data-v="${c}">${c}</button>`).join('')}</div></div>
    <div class="field"><label>الجو</label><button class="btn block" id="sWx">${IC.pin} ${S.set.wxOn?'تحديث الجو من موقعي':'استخدم موقعي لجو حقيقي'}</button>
      <p class="hint" style="margin-top:6px">موقعك يروح بس لخدمة الطقس المجانية Open-Meteo، وما ينحفظ.</p></div>
    <div class="field"><label>النسخة الاحتياطية</label>
      <p class="hint" style="margin-top:0">كل شي محفوظ <b>على جوالك بس</b>. لو حذفت التطبيق أو مسحت بيانات سفاري يروح كل شي — خذ نسخة كل فترة واحفظها في الملفات أو iCloud.</p>
      <div style="display:grid;gap:10px"><button class="btn" id="bExp">⬇️ تصدير نسخة</button><button class="btn" id="bImp">⬆️ استرجاع نسخة</button></div></div>
    <button class="btn danger block" id="bWipe">${IC.trash} مسح كل شي</button>
    <p class="hint" style="margin-top:18px">📸 نصايح للتصوير: افرد القطعة على خلفية سادة تختلف عن لونها، بإضاءة نهار، وصوّر من فوق. كذا تنشال الخلفية صح ويطلع اللون مضبوط.</p>`);
  $('sCur').onclick=async e=>{ const b=e.target.closest('[data-v]'); if(!b) return; S.set.cur=b.dataset.v; await saveSet();
    $('sCur').querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===b)); render(); };
  $('sWx').onclick=()=>{ closeSheet(); S.wxManual=false; fetchWeather(true); };
  $('bExp').onclick=exportData;
  $('bImp').onclick=()=>{ $('importIn').value=''; $('importIn').click(); };
  $('bWipe').onclick=async()=>{ if(!confirm('بتنمسح كل القطع والأوتفتات والتقويم. متأكد؟')) return;
    for(const s of ['items','outfits','plans','trips']) await DB.clear(s);
    Object.assign(S,{items:[],outfits:[],plans:{},trips:[],results:[],locks:{}}); closeSheet(); render(); toast('انمسح كل شي'); };
};
async function exportData(){
  const data=JSON.stringify({app:'khzanti',v:2,items:S.items,outfits:S.outfits,plans:Object.values(S.plans),trips:S.trips,settings:S.set});
  const file=new File([data],`khzanti-${today()}.json`,{type:'application/json'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){ try{ await navigator.share({files:[file],title:'نسخة خزانتي'}); return; }catch(e){ if(e.name==='AbortError') return; } }
  const a=document.createElement('a'); a.href=URL.createObjectURL(file); a.download=file.name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),4000);
}
$('importIn').addEventListener('change',async e=>{
  const f=e.target.files[0]; if(!f) return;
  try{ busy(true,'أسترجع النسخة…'); const d=JSON.parse(await f.text()); if(d.app!=='khzanti') throw 0;
    await DB.putMany('items',d.items||[]); await DB.putMany('outfits',d.outfits||[]);
    if(d.plans) await DB.putMany('plans',d.plans); if(d.trips) await DB.putMany('trips',d.trips);
    if(d.settings){ S.set={...S.set,...d.settings}; await saveSet(); }
    await load(); busy(false); closeSheet(); render(); toast(`رجعت ${(d.items||[]).length} قطعة ✓`);
  }catch(err){ busy(false); toast('الملف مو نسخة من خزانتي'); }
});

/* ---------------- boot ---------------- */
async function load(){
  S.items=(await DB.all('items')).map(i=>({seasons:['all'],occs:[],tags:[],name:'',brand:'',price:'',size:'',cut:false,ar:1.25,wears:0,lastWorn:0,...i}));
  S.outfits=(await DB.all('outfits')).map(o=>({created:o.date||Date.now(),key:[...o.ids].sort().join('|'),...o}));
  S.plans={}; (await DB.all('plans')).forEach(p=>S.plans[p.date]=p);
  S.trips=await DB.all('trips');
  S.set={...S.set,...((await DB.get('kv','settings'))||{})};
  S.wxInfo=(await DB.get('kv','wx'))||null;
  // migrate v1: "worn" outfits become calendar entries
  const legacy=S.outfits.filter(o=>o.worn);
  for(const o of legacy){ const d=ymd(new Date(o.date)); if(!S.plans[d]){ S.plans[d]={date:d,ids:o.ids,layout:null,worn:true}; await DB.put('plans',S.plans[d]); }
    delete o.worn; if(o.fav===false){ S.outfits=S.outfits.filter(x=>x!==o); await DB.del('outfits',o.id); } else await DB.put('outfits',o); }
  if(legacy.length) await recomputeWear();
}
(async function init(){
  S.wx=autoWxByMonth();
  try{ await load(); }catch(e){ console.error(e); toast('ما قدرت أفتح التخزين'); }
  if(navigator.storage&&navigator.storage.persist) navigator.storage.persist().catch(()=>{});
  go('closet');
  // refresh weather silently if the user turned it on before and permission is already granted
  if(S.set.wxOn&&(!S.wxInfo||Date.now()-S.wxInfo.at>3*3600e3)){
    try{ const p=await navigator.permissions.query({name:'geolocation'}); if(p.state==='granted') fetchWeather(false); }catch(e){}
  }
  if('serviceWorker' in navigator&&location.protocol==='https:') navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
