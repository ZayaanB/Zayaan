(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,11199,e=>{"use strict";var a=e.i(43476),r=e.i(71645);let t={blue:{base:220,spread:200},purple:{base:280,spread:300},green:{base:152,spread:58},red:{base:0,spread:200},orange:{base:30,spread:200}},i={sm:"w-48 h-64",md:"w-64 h-80",lg:"w-80 h-96"},s=`
  [data-glow]::before,
  [data-glow]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: calc(var(--radius) * 1px);
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-repeat: no-repeat;
    background-position: 50% 50%;
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask-clip: padding-box, border-box;
    mask-composite: intersect;
  }

  [data-glow]::before {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 152) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)), transparent 100%
    );
    filter: brightness(1.3);
  }

  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(0 100% 100% / var(--border-light-opacity, 1)), transparent 100%
    );
  }

  [data-glow] [data-glow] {
    position: absolute;
    inset: 0;
    will-change: filter;
    opacity: var(--outer, 1);
    border-radius: calc(var(--radius) * 1px);
    border-width: calc(var(--border-size) * 20);
    filter: blur(calc(var(--border-size) * 10));
    background: none;
    pointer-events: none;
    border: none;
  }

  [data-glow] > [data-glow]::before {
    inset: -10px;
    border-width: 10px;
  }
`;e.s(["GlowCard",0,({children:e,className:n="",glowColor:o="green",size:l="md",width:d,height:c,customSize:p=!1})=>{let h=(0,r.useRef)(null);(0,r.useEffect)(()=>{let e=h.current;if(!e)return;let a=a=>{let r=e.getBoundingClientRect(),t=a.clientX-r.left,i=a.clientY-r.top;e.style.setProperty("--x",t.toFixed(2)),e.style.setProperty("--y",i.toFixed(2)),e.style.setProperty("--xp",(a.clientX/window.innerWidth).toFixed(2)),e.style.setProperty("--yp",(a.clientY/window.innerHeight).toFixed(2))};return document.addEventListener("pointermove",a),()=>document.removeEventListener("pointermove",a)},[]);let{base:g,spread:u}=t[o],b={"--base":g,"--spread":u,"--radius":"14","--border":"2","--backdrop":"rgba(15, 18, 35, 0.85)","--backup-border":"rgba(0, 255, 136, 0.18)","--border-light-opacity":"0.12","--size":"240","--outer":"1","--border-size":"calc(var(--border, 2) * 1px)","--spotlight-size":"calc(var(--size, 150) * 1px)","--hue":"calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",backgroundImage:`radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 50%) * 1px)
      calc(var(--y, 50%) * 1px),
      hsl(var(--hue, 152) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.08)), transparent
    )`,backgroundColor:"var(--backdrop, transparent)",backgroundSize:"calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",backgroundPosition:"50% 50%",border:"var(--border-size) solid var(--backup-border)",position:"relative",touchAction:"none",...void 0!==d?{width:"number"==typeof d?`${d}px`:d}:{},...void 0!==c?{height:"number"==typeof c?`${c}px`:c}:{}},m=p?"":i[l];return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("style",{dangerouslySetInnerHTML:{__html:s}}),(0,a.jsxs)("div",{ref:h,"data-glow":!0,style:b,className:`
          ${m}
          rounded-2xl
          relative
          shadow-[0_1rem_2rem_-1rem_black]
          p-5
          backdrop-blur-[5px]
          transition-transform
          duration-300
          hover:-translate-y-1
          ${n}
        `.replace(/\s+/g," ").trim(),children:[(0,a.jsx)("div",{"data-glow":!0}),e]})]})}])},31713,e=>{"use strict";var a=e.i(43476),r=e.i(70703),t=e.i(22016),i=e.i(11199);let s=(0,r.default)(()=>e.A(1898).then(e=>e.HeroFuturistic),{loadableGenerated:{modules:[83975]},ssr:!1}),n=["Python","Java","C/C++","SQL","JavaScript","TypeScript","HTML/CSS","OpenCV","PyTorch","NumPy","Tailwind CSS","Next.js","FastAPI","Git","Linux","Docker","AWS","Supabase","PostgreSQL","Arduino"],o=[{title:"Leadership & Communication",body:"As an executive at AMACSS, I produce and distribute a departmental newsletter for the CMS Department, reaching over 2,000 students with an open rate above 50%."},{title:"Competition & Mentorship",body:"Placed Top 20 globally in Startup Marketing Campaigns at DECA ICDC. Coached 8 students in written events and marketing strategy, around 50% qualified for the conference."},{title:"Robotics & Systems Thinking",body:"Co-president and founder of NASA HUNCH Canada, the first-ever Canadian school to compete. Built an autonomous Lunar Explorer using C++ and Arduino for complex mission-style design challenges."},{title:"Product & Data Mindset",body:"As VP of Technology at BLINK JA, led a team of 5 to design and maintain a company website generating over $2,300 in online sales, increasing website traffic by 30% through data-driven decisions."}];e.s(["default",0,function(){return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(s,{}),(0,a.jsxs)("main",{className:"relative",style:{paddingTop:"2.5rem",paddingBottom:"4rem",overflow:"hidden"},children:[(0,a.jsxs)("section",{className:"p-section p-container",children:[(0,a.jsxs)("div",{className:"p-section-head",children:[(0,a.jsx)("h2",{className:"p-h2",children:"Technical Skills"}),(0,a.jsx)("p",{children:"Languages and tools from my coursework and project work."})]}),(0,a.jsx)("div",{className:"p-chip-row",children:n.map(e=>(0,a.jsx)("span",{className:"p-chip",children:e},e))})]}),(0,a.jsxs)("section",{className:"p-section p-container",children:[(0,a.jsxs)("div",{className:"p-section-head",children:[(0,a.jsx)("h2",{className:"p-h2",children:"Quick Profile"}),(0,a.jsx)("p",{children:"Highlights from leadership, engineering, and team-based problem solving."})]}),(0,a.jsx)("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:"1.25rem"},children:o.map(e=>(0,a.jsxs)(i.GlowCard,{customSize:!0,className:"w-full flex flex-col gap-2",children:[(0,a.jsx)("h3",{style:{fontFamily:"'Sora', sans-serif",fontSize:"1.05rem",fontWeight:700,color:"var(--p-text)",margin:0},children:e.title}),(0,a.jsx)("p",{style:{color:"var(--p-muted)",fontSize:"0.9rem",margin:0,lineHeight:1.65},children:e.body})]},e.title))})]}),(0,a.jsx)("section",{className:"p-section p-container",style:{textAlign:"center"},children:(0,a.jsxs)("div",{style:{display:"flex",justifyContent:"center",gap:"0.75rem",flexWrap:"wrap"},children:[(0,a.jsx)(t.default,{className:"p-btn p-btn-primary",href:"/projects",children:"View Projects"}),(0,a.jsx)(t.default,{className:"p-btn p-btn-secondary",href:"/experience",children:"See Experience"})]})})]})]})}])},1898,e=>{e.v(a=>Promise.all(["static/chunks/0ejc16gh.2lo_.js"].map(a=>e.l(a))).then(()=>a(83975)))}]);