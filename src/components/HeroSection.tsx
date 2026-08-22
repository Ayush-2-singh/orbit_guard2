import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import StarsCanvas from "./StarsCanvas";

// @ts-ignore
import astronautImg from "@assets/astronaut.png";

export default function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      const words = titleRef.current.querySelectorAll(".word");
      gsap.fromTo(
        words,
        { opacity: 0, y: 60, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, stagger: 0.12, ease: "power4.out", delay: 0.4 }
      );
    }
  }, []);

  return (
    <section className="relative w-full h-[100dvh] overflow-hidden flex flex-col items-center justify-center">
      {/* Deep space bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#030A18] to-[#020617] z-0" />
      <StarsCanvas />

      {/* Center nebula */}
      <div className="absolute z-[1] pointer-events-none" style={{ top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"75vw", height:"75vw", maxWidth:"950px", maxHeight:"950px", background:"radial-gradient(ellipse at center, rgba(56,189,248,0.14) 0%, rgba(14,80,180,0.07) 45%, transparent 70%)", filter:"blur(50px)", borderRadius:"50%" }} />

      {/* Earth */}
      <div className="absolute z-[2] pointer-events-none" style={{ bottom:"-28vw", left:"50%", transform:"translateX(-50%)", width:"70vw", height:"70vw", maxWidth:"900px", maxHeight:"900px" }}>
        <div className="absolute inset-0 rounded-full" style={{ background:"radial-gradient(ellipse at center, transparent 55%, rgba(56,189,248,0.22) 70%, rgba(20,80,220,0.3) 80%, transparent 100%)", filter:"blur(8px)" }} />
        <div className="absolute rounded-full" style={{ inset:"-4%", background:"radial-gradient(ellipse at center, transparent 54%, rgba(96,165,250,0.18) 58%, rgba(96,165,250,0.07) 65%, transparent 72%)" }} />
        <div className="absolute inset-0 rounded-full overflow-hidden" style={{ animation:"earthSpin 40s linear infinite", boxShadow:"inset -30px -10px 60px rgba(0,0,0,0.85), inset 15px 15px 40px rgba(56,189,248,0.12), 0 0 80px rgba(56,189,248,0.25), 0 0 150px rgba(30,100,220,0.12)", background:"conic-gradient(from 0deg, #0a1a40, #0d2255, #0a1a40, #071530, #0a1a40, #0d2255, #071530, #0a1a40)" }}>
          <div className="absolute" style={{ top:"20%", left:"15%", width:"25%", height:"18%", background:"rgba(20,80,40,0.55)", borderRadius:"40% 60% 55% 45%", filter:"blur(3px)" }} />
          <div className="absolute" style={{ top:"35%", left:"35%", width:"30%", height:"22%", background:"rgba(15,70,35,0.5)", borderRadius:"60% 40% 50% 50%", filter:"blur(3px)" }} />
          <div className="absolute" style={{ top:"55%", left:"20%", width:"18%", height:"14%", background:"rgba(18,75,38,0.45)", borderRadius:"50% 50% 60% 40%", filter:"blur(2px)" }} />
          <div className="absolute" style={{ top:"25%", right:"15%", width:"22%", height:"20%", background:"rgba(16,72,36,0.5)", borderRadius:"45% 55% 40% 60%", filter:"blur(3px)" }} />
          <div className="absolute" style={{ top:"15%", left:"30%", width:"40%", height:"8%", background:"rgba(200,220,255,0.12)", borderRadius:"50%", filter:"blur(4px)" }} />
          <div className="absolute" style={{ top:"10%", left:"20%", width:"20%", height:"15%", background:"radial-gradient(ellipse, rgba(180,210,255,0.15) 0%, transparent 70%)", borderRadius:"50%" }} />
          {/* Satellite dots */}
          {[{top:"30%",left:"70%"},{top:"60%",left:"55%"},{top:"20%",left:"45%"}].map((pos,i)=>(
            <div key={i} className="absolute w-1 h-1 rounded-full bg-sky-300" style={{...pos, boxShadow:"0 0 6px rgba(56,189,248,0.8)", animation:`pulse 2s ease-in-out ${i*0.7}s infinite`}} />
          ))}
        </div>
      </div>

      {/* Orbital rings */}
      {[{b:"-18vw",w:"90vw",max:"1100px",rx:"72deg",dur:"70s",c:"rgba(56,189,248,0.08)"},{b:"-22vw",w:"110vw",max:"1300px",rx:"74deg",dur:"100s",c:"rgba(96,165,250,0.05)"},{b:"-25vw",w:"130vw",max:"1500px",rx:"70deg",dur:"130s",c:"rgba(255,255,255,0.03)"}].map((r,i)=>(
        <div key={i} className="absolute z-[3] pointer-events-none" style={{ bottom:r.b, left:"50%", transform:`translateX(-50%) rotateX(${r.rx})`, width:r.w, height:r.w, maxWidth:r.max, maxHeight:r.max, borderRadius:"50%", border:`1px solid ${r.c}`, animation:`orbitSpin ${r.dur} linear infinite ${i%2===1?"reverse":""}` }} />
      ))}

      {/* Light shaft from Earth */}
      <div className="absolute z-[3] pointer-events-none" style={{ bottom:0, left:"50%", transform:"translateX(-50%)", width:"60vw", maxWidth:"700px", height:"55vh", background:"linear-gradient(to top, rgba(56,189,248,0.10) 0%, rgba(56,189,248,0.03) 50%, transparent 100%)", filter:"blur(30px)" }} />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center w-full h-full" style={{ zIndex:10 }}>

        {/* Badge */}
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{delay:0.2,duration:0.7}}
          className="mb-6 px-4 py-1.5 rounded-full border border-sky-400/30 bg-sky-400/8 backdrop-blur-sm flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-sky-300 text-xs font-mono tracking-[0.25em] uppercase">Orbital Intelligence Platform</span>
        </motion.div>

        {/* Headline — behind astronaut */}
        <h1 ref={titleRef} className="absolute font-sans font-black text-white whitespace-nowrap select-none text-center" style={{ fontSize:"clamp(5rem,14vw,18rem)", lineHeight:1, letterSpacing:"-0.02em", top:"50%", left:"50%", transform:"translate(-50%,-50%)", display:"flex", gap:"0.15em" }}>
          <span className="word inline-block" style={{ zIndex:5, textShadow:"0 0 80px rgba(56,189,248,0.35)" }}>ORBIT</span>
          <span className="word inline-block" style={{ zIndex:15, textShadow:"0 0 80px rgba(56,189,248,0.35)" }}>GUARD</span>
        </h1>

        {/* Astronaut */}
        <motion.div className="absolute pointer-events-none" style={{ zIndex:10, width:"clamp(200px,28vw,440px)", filter:"drop-shadow(0 0 40px rgba(56,189,248,0.5)) drop-shadow(0 0 80px rgba(56,189,248,0.2))", top:"50%", left:"50%", transform:"translate(-50%,-50%)" }}
          animate={{ y:["-52%","-59%","-52%"], rotate:[-2,2,-2] }}
          transition={{ duration:6, ease:"easeInOut", repeat:Infinity }}>
          <img src={astronautImg} alt="Astronaut" className="w-full h-auto object-contain" />
        </motion.div>

        {/* Tagline + CTAs */}
        <div className="absolute bottom-[8vh] flex flex-col items-center gap-6 px-6 text-center" style={{ zIndex:20 }}>
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1.4,duration:0.8}}
            className="text-white/55 font-light tracking-wide text-sm sm:text-base max-w-xl leading-relaxed">
            AI-powered orbital intelligence for tracking satellites, monitoring debris,<br className="hidden sm:block" /> predicting collision risks, and enabling safer space operations.
          </motion.p>
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:1.7,duration:0.7}} className="flex items-center gap-4 flex-wrap justify-center">
            <motion.button data-testid="button-request-demo" whileHover={{y:-2, boxShadow:"0 0 30px rgba(56,189,248,0.55)"}} whileTap={{scale:0.97}}
              className="px-8 py-3.5 rounded-full font-sans font-semibold text-sm tracking-wider text-white cursor-pointer"
              style={{ backdropFilter:"blur(20px)", background:"rgba(56,189,248,0.15)", border:"1px solid rgba(56,189,248,0.45)", boxShadow:"0 0 20px rgba(56,189,248,0.15)" }}>
              Request Demo →
            </motion.button>
            <motion.button data-testid="button-explore-platform" whileHover={{y:-2}} whileTap={{scale:0.97}}
              className="px-8 py-3.5 rounded-full font-sans font-semibold text-sm tracking-wider text-white/70 cursor-pointer"
              style={{ backdropFilter:"blur(10px)", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.12)" }}>
              Explore Platform
            </motion.button>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes earthSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes orbitSpin { from{transform:translateX(-50%) rotateX(72deg) rotate(0deg)} to{transform:translateX(-50%) rotateX(72deg) rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }
      `}</style>
    </section>
  );
}
