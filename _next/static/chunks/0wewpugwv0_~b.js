(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,11199,e=>{"use strict";var t=e.i(43476),a=e.i(71645);let r={blue:{base:220,spread:200},purple:{base:280,spread:300},green:{base:152,spread:58},red:{base:0,spread:200},orange:{base:30,spread:200}},i={sm:"w-48 h-64",md:"w-64 h-80",lg:"w-80 h-96"},s=`
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
`;e.s(["GlowCard",0,({children:e,className:n="",glowColor:l="green",size:o="md",width:c,height:d,customSize:p=!1})=>{let h=(0,a.useRef)(null);(0,a.useEffect)(()=>{let e=h.current;if(!e)return;let t=t=>{let a=e.getBoundingClientRect(),r=t.clientX-a.left,i=t.clientY-a.top;e.style.setProperty("--x",r.toFixed(2)),e.style.setProperty("--y",i.toFixed(2)),e.style.setProperty("--xp",(t.clientX/window.innerWidth).toFixed(2)),e.style.setProperty("--yp",(t.clientY/window.innerHeight).toFixed(2))};return document.addEventListener("pointermove",t),()=>document.removeEventListener("pointermove",t)},[]);let{base:u,spread:b}=r[l],m={"--base":u,"--spread":b,"--radius":"14","--border":"2","--backdrop":"rgba(15, 18, 35, 0.85)","--backup-border":"rgba(0, 255, 136, 0.18)","--border-light-opacity":"0.12","--size":"240","--outer":"1","--border-size":"calc(var(--border, 2) * 1px)","--spotlight-size":"calc(var(--size, 150) * 1px)","--hue":"calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",backgroundImage:`radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 50%) * 1px)
      calc(var(--y, 50%) * 1px),
      hsl(var(--hue, 152) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.08)), transparent
    )`,backgroundColor:"var(--backdrop, transparent)",backgroundSize:"calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",backgroundPosition:"50% 50%",border:"var(--border-size) solid var(--backup-border)",position:"relative",touchAction:"none",...void 0!==c?{width:"number"==typeof c?`${c}px`:c}:{},...void 0!==d?{height:"number"==typeof d?`${d}px`:d}:{}},g=p?"":i[o];return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("style",{dangerouslySetInnerHTML:{__html:s}}),(0,t.jsxs)("div",{ref:h,"data-glow":!0,style:m,className:`
          ${g}
          rounded-2xl
          relative
          shadow-[0_1rem_2rem_-1rem_black]
          p-5
          backdrop-blur-[5px]
          transition-transform
          duration-300
          hover:-translate-y-1
          ${n}
        `.replace(/\s+/g," ").trim(),children:[(0,t.jsx)("div",{"data-glow":!0}),e]})]})}])},31713,e=>{"use strict";var t=e.i(43476),a=e.i(70703),r=e.i(22016),i=e.i(71645),s=e.i(46932),n=e.i(11199);function l({cards:e}){let[a,r]=(0,i.useState)(0),[o,c]=(0,i.useState)(200);(0,i.useEffect)(()=>{let e=()=>c(window.innerWidth<640?95:200);return e(),window.addEventListener("resize",e),()=>window.removeEventListener("resize",e)},[]);let d=()=>{a<e.length&&r(a+1)},p=()=>{a>0&&r(a-1)},[h,u]=(0,i.useState)("");return(0,i.useEffect)(()=>{u(Array.from({length:600}).map(()=>Math.random()>.5?"1":"0").join(" "))},[]),(0,t.jsxs)("div",{className:"w-full flex flex-col items-center justify-center pt-8 pb-10 relative",children:[(0,t.jsx)("div",{className:"w-full max-w-[800px] h-[460px] relative flex justify-center items-center",style:{perspective:"1500px"},children:e.map((r,i)=>{let l=i>=a,c=Math.min(6*(i>=a?i-a:a-1-i),18),u=[0,-2,3,-1,2][(i>=a?i-a:a-1-i)%5]||0,b=l?e.length-i:i+1;return(0,t.jsxs)(s.motion.div,{className:"absolute top-1/2 left-1/2 cursor-pointer w-[280px] h-[380px] sm:w-[320px] sm:h-[420px]",initial:!1,animate:{x:`calc(-50% + ${l?o:-o}px)`,y:`calc(-50% + ${c}px)`,rotateY:180*!l,rotateZ:u,zIndex:b},transition:{type:"spring",stiffness:260,damping:20},onClick:l?d:p,style:{transformStyle:"preserve-3d"},title:l?"Click to flip card":"Click to view card",children:[(0,t.jsx)("div",{className:"w-full h-full absolute top-0 left-0",style:{backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden"},children:(0,t.jsxs)(n.GlowCard,{customSize:!0,className:"w-full h-full flex flex-col p-8 gap-4 shadow-xl !bg-[#0b0e17]",children:[(0,t.jsx)("h3",{className:"text-xl font-bold font-sora mb-2 leading-tight tracking-tight text-[#00ff88]",children:r.title}),(0,t.jsx)("p",{className:"text-gray-300 leading-relaxed text-sm",children:r.body})]})}),(0,t.jsx)("div",{className:"w-full h-full absolute top-0 left-0",style:{backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",transform:"rotateY(180deg)"},children:(0,t.jsxs)(n.GlowCard,{customSize:!0,className:"w-full h-full flex items-center justify-center overflow-hidden border-[#00ff88]/30 !bg-[#0b0e17]",children:[(0,t.jsx)("div",{className:"absolute inset-0 opacity-10 flex flex-wrap content-start text-[10px] text-[#00ff88] break-all leading-tight font-mono pointer-events-none p-4 select-none",children:h}),(0,t.jsx)("div",{className:"z-10 bg-black/60 p-5 border border-[#00ff88]/30 rounded-xl w-20 h-20 flex items-center justify-center backdrop-blur-md shadow-lg rotate-45",children:(0,t.jsx)("div",{className:"w-10 h-10 border-2 border-[#00ff88] rounded-sm flex items-center justify-center -rotate-45 relative",children:(0,t.jsx)("div",{className:"absolute w-2 h-2 bg-[#00ff88] rounded-full top-1 left-1 animate-pulse"})})})]})})]},r.title)})}),(0,t.jsx)("div",{className:"text-center mt-6",children:(0,t.jsx)("p",{className:"text-gray-400 text-sm tracking-wide bg-gray-900/50 px-4 py-2 rounded-full border border-gray-800",children:a<e.length?"Click the face-up pile to see the next card.":"All cards flipped. Click the face-down pile to restart."})})]})}let o=(0,a.default)(()=>e.A(1898).then(e=>e.HeroFuturistic),{loadableGenerated:{modules:[83975]},ssr:!1}),c=["Python","Java","C/C++","SQL","JavaScript","TypeScript","HTML/CSS","OpenCV","PyTorch","NumPy","Tailwind CSS","Next.js","FastAPI","Git","Linux","Docker","AWS","Supabase","PostgreSQL","Arduino"],d=[{title:"Leadership & Communication",body:"As an executive at AMACSS, I produce and distribute a departmental newsletter for the CMS Department, reaching over 2,000 students with an open rate above 50%."},{title:"Competition & Mentorship",body:"Placed Top 20 globally in Startup Marketing Campaigns at DECA ICDC. Coached 8 students in written events and marketing strategy, around 50% qualified for the conference."},{title:"Robotics & Systems Thinking",body:"Co-president and founder of NASA HUNCH Canada, the first-ever Canadian school to compete. Built an autonomous Lunar Explorer using C++ and Arduino for complex mission-style design challenges."},{title:"Product & Data Mindset",body:"As VP of Technology at BLINK JA, led a team of 5 to design and maintain a company website generating over $2,300 in online sales, increasing website traffic by 30% through data-driven decisions."}];e.s(["default",0,function(){return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(o,{}),(0,t.jsxs)("main",{className:"relative",style:{paddingTop:"1rem",paddingBottom:"4rem",overflow:"hidden"},children:[(0,t.jsxs)("section",{className:"p-section p-container",children:[(0,t.jsxs)("div",{className:"p-section-head",children:[(0,t.jsx)("h2",{className:"p-h2",children:"Technical Skills"}),(0,t.jsx)("p",{children:"Languages and tools from my coursework and project work."})]}),(0,t.jsx)("div",{className:"p-chip-row",children:c.map(e=>(0,t.jsx)("span",{className:"p-chip",children:e},e))})]}),(0,t.jsxs)("section",{className:"p-section p-container",children:[(0,t.jsxs)("div",{className:"p-section-head",children:[(0,t.jsx)("h2",{className:"p-h2",children:"Quick Profile"}),(0,t.jsx)("p",{children:"Highlights from leadership, engineering, and team-based problem solving."})]}),(0,t.jsx)(l,{cards:d})]}),(0,t.jsx)("section",{className:"p-section p-container",style:{textAlign:"center"},children:(0,t.jsxs)("div",{style:{display:"flex",justifyContent:"center",gap:"0.75rem",flexWrap:"wrap"},children:[(0,t.jsx)(r.default,{className:"p-btn p-btn-primary",href:"/projects",children:"View Projects"}),(0,t.jsx)(r.default,{className:"p-btn p-btn-secondary",href:"/experience",children:"See Experience"})]})})]})]})}],31713)},1898,e=>{e.v(t=>Promise.all(["static/chunks/0hnpuf~p8_in-.js"].map(t=>e.l(t))).then(()=>t(83975)))}]);