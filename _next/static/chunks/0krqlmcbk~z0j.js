(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,11199,e=>{"use strict";var r=e.i(43476),a=e.i(71645);let t={blue:{base:220,spread:200},purple:{base:280,spread:300},green:{base:152,spread:58},red:{base:0,spread:200},orange:{base:30,spread:200}},o={sm:"w-48 h-64",md:"w-64 h-80",lg:"w-80 h-96"},i=`
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
`;e.s(["GlowCard",0,({children:e,className:s="",glowColor:n="green",size:l="md",width:d,height:c,customSize:p=!1})=>{let b=(0,a.useRef)(null);(0,a.useEffect)(()=>{let e=b.current;if(!e)return;let r=r=>{let a=e.getBoundingClientRect(),t=r.clientX-a.left,o=r.clientY-a.top;e.style.setProperty("--x",t.toFixed(2)),e.style.setProperty("--y",o.toFixed(2)),e.style.setProperty("--xp",(r.clientX/window.innerWidth).toFixed(2)),e.style.setProperty("--yp",(r.clientY/window.innerHeight).toFixed(2))};return document.addEventListener("pointermove",r),()=>document.removeEventListener("pointermove",r)},[]);let{base:g,spread:v}=t[n],u={"--base":g,"--spread":v,"--radius":"14","--border":"2","--backdrop":"rgba(15, 18, 35, 0.85)","--backup-border":"rgba(0, 255, 136, 0.18)","--border-light-opacity":"0.12","--size":"240","--outer":"1","--border-size":"calc(var(--border, 2) * 1px)","--spotlight-size":"calc(var(--size, 150) * 1px)","--hue":"calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",backgroundImage:`radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 50%) * 1px)
      calc(var(--y, 50%) * 1px),
      hsl(var(--hue, 152) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.08)), transparent
    )`,backgroundColor:"var(--backdrop, transparent)",backgroundSize:"calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",backgroundPosition:"50% 50%",border:"var(--border-size) solid var(--backup-border)",position:"relative",touchAction:"none",...void 0!==d?{width:"number"==typeof d?`${d}px`:d}:{},...void 0!==c?{height:"number"==typeof c?`${c}px`:c}:{}},h=p?"":o[l];return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("style",{dangerouslySetInnerHTML:{__html:i}}),(0,r.jsxs)("div",{ref:b,"data-glow":!0,style:u,className:`
          ${h}
          rounded-2xl
          relative
          shadow-[0_1rem_2rem_-1rem_black]
          p-5
          backdrop-blur-[5px]
          transition-transform
          duration-300
          hover:-translate-y-1
          ${s}
        `.replace(/\s+/g," ").trim(),children:[(0,r.jsx)("div",{"data-glow":!0}),e]})]})}])},1898,e=>{e.v(r=>Promise.all(["static/chunks/0lq_d464q4lch.js"].map(r=>e.l(r))).then(()=>r(83975)))}]);