import Navbar from "@/components/Navbar";
import StarsCanvas from "@/components/StarsCanvas";
import { motion } from "framer-motion";

const lineup = [
  {
    id: 1,
    day: "Day 1",
    time: "7:00 PM",
    artist: "RAFTAAR",
    genre: "Hip-Hop · Rap",
    desc: "The god of Indian hip-hop. Verses that hit harder than gravity.",
    tag: "HEADLINE",
    tagColor: "#2a75ff",
  },
  {
    id: 2,
    day: "Day 1",
    time: "5:30 PM",
    artist: "DIVINE",
    genre: "Street Rap · Gully",
    desc: "From the streets of Mumbai to the mainstage. Unfiltered. Raw. Real.",
    tag: "OPENING",
    tagColor: "#22c55e",
  },
  {
    id: 3,
    day: "Day 2",
    time: "8:00 PM",
    artist: "RITVIZ",
    genre: "Electronic · Indie",
    desc: "Cosmic soundscapes that transcend genre. A night you won't forget.",
    tag: "HEADLINE",
    tagColor: "#a855f7",
  },
  {
    id: 4,
    day: "Day 2",
    time: "6:00 PM",
    artist: "PRATEEK KUHAD",
    genre: "Indie Folk · Acoustic",
    desc: "Intimate, ethereal, and deeply human. Songs written in the stars.",
    tag: "SPECIAL",
    tagColor: "#f59e0b",
  },
];

export default function ProshowPage() {
  return (
    <main className="relative min-h-screen w-full bg-[#010308] overflow-x-hidden">
      <div className="absolute inset-0 z-0">
        <StarsCanvas />
      </div>

      {/* Purple nebula for proshow mood */}
      <div
        className="absolute z-0 pointer-events-none"
        style={{
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80vw",
          height: "80vw",
          maxWidth: "900px",
          background:
            "radial-gradient(ellipse at center, rgba(120,40,220,0.18) 0%, rgba(60,20,140,0.08) 50%, transparent 70%)",
          filter: "blur(60px)",
          borderRadius: "50%",
        }}
      />

      <Navbar />

      <div className="relative z-10 pt-32 pb-24 px-6 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-xs tracking-[0.4em] text-purple-400/70 uppercase mb-4">
            INGRIDEA 2025
          </p>
          <h1 className="font-sans font-black text-white text-5xl sm:text-7xl lg:text-8xl leading-none tracking-tight mb-6">
            PROSHOW
          </h1>
          <p className="text-white/50 font-light tracking-widest text-sm sm:text-base max-w-xl mx-auto">
            Two nights. Four acts. One stage. Zero chill.
          </p>
        </motion.div>

        {/* Lineup */}
        <div className="flex flex-col gap-6">
          {lineup.map((act, i) => (
            <motion.div
              key={act.id}
              data-testid={`card-artist-${act.id}`}
              initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 * i + 0.3, duration: 0.8, ease: "easeOut" }}
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(16px)",
              }}
            >
              {/* Left accent */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                style={{ background: act.tagColor }}
              />

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at left, ${act.tagColor}10 0%, transparent 60%)` }}
              />

              <div className="pl-8 pr-7 py-7 flex flex-col sm:flex-row sm:items-center gap-6">
                {/* Time & day */}
                <div className="text-center sm:text-left min-w-[90px]">
                  <p className="font-mono text-xs text-white/30 mb-1">{act.day}</p>
                  <p className="font-mono text-lg font-bold text-white/70">{act.time}</p>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-14 bg-white/10" />

                {/* Artist info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="font-sans font-black text-white text-3xl sm:text-4xl tracking-tight leading-none">
                      {act.artist}
                    </h3>
                    <span
                      className="text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-1 rounded-full"
                      style={{
                        color: act.tagColor,
                        background: `${act.tagColor}20`,
                        border: `1px solid ${act.tagColor}40`,
                      }}
                    >
                      {act.tag}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 font-mono tracking-wider mb-2">{act.genre}</p>
                  <p className="text-white/55 text-sm leading-relaxed">{act.desc}</p>
                </div>

                {/* Arrow */}
                <motion.div
                  className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full border border-white/10 text-white/30 group-hover:border-white/30 group-hover:text-white transition-all text-lg"
                  whileHover={{ x: 4 }}
                >
                  →
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Ticket CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="text-center mt-20"
        >
          <p className="text-white/40 text-xs tracking-widest mb-6 uppercase">
            Limited passes available
          </p>
          <motion.button
            data-testid="button-get-tickets"
            whileHover={{
              y: -3,
              boxShadow: "0 0 40px rgba(168,85,247,0.5), 0 0 80px rgba(168,85,247,0.2)",
            }}
            whileTap={{ scale: 0.97 }}
            className="px-12 py-4 rounded-full font-sans font-bold text-sm tracking-[0.2em] text-white cursor-pointer"
            style={{
              backdropFilter: "blur(20px)",
              background: "rgba(168,85,247,0.12)",
              border: "1px solid rgba(168,85,247,0.4)",
              boxShadow: "0 0 20px rgba(168,85,247,0.15)",
            }}
          >
            GET PASSES →
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
}
