import Navbar from "@/components/Navbar";
import StarsCanvas from "@/components/StarsCanvas";
import { motion } from "framer-motion";

const events = [
  {
    id: 1,
    category: "Technical",
    title: "Hackathon",
    desc: "24-hour coding sprint. Build, break, innovate. Only the bold survive.",
    date: "Day 1 · 10:00 AM",
    seats: "200 teams",
    color: "#2a75ff",
  },
  {
    id: 2,
    category: "Technical",
    title: "Robowar",
    desc: "Steel meets strategy. Engineer your robot, enter the arena, dominate.",
    date: "Day 1 · 2:00 PM",
    seats: "50 teams",
    color: "#00c6ff",
  },
  {
    id: 3,
    category: "Creative",
    title: "Short Film",
    desc: "48 hours. One story. Zero excuses. Bring your vision to life.",
    date: "Day 2 · 9:00 AM",
    seats: "30 teams",
    color: "#a855f7",
  },
  {
    id: 4,
    category: "Creative",
    title: "Photography",
    desc: "The campus is your canvas. Capture what others walk past.",
    date: "Day 2 · 11:00 AM",
    seats: "Unlimited",
    color: "#ec4899",
  },
  {
    id: 5,
    category: "Gaming",
    title: "E-Sports",
    desc: "Valorant. BGMI. Chess. Prove your rank isn't just a number.",
    date: "Day 1–2 · All day",
    seats: "128 players",
    color: "#22c55e",
  },
  {
    id: 6,
    category: "Cultural",
    title: "Dance Battle",
    desc: "Freestyle. Choreography. The stage is lit — are you?",
    date: "Day 2 · 6:00 PM",
    seats: "40 teams",
    color: "#f59e0b",
  },
];

const categories = ["All", "Technical", "Creative", "Gaming", "Cultural"];

export default function EventsPage() {
  return (
    <main className="relative min-h-screen w-full bg-[#010308] overflow-x-hidden">
      <div className="absolute inset-0 z-0">
        <StarsCanvas />
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#010308] via-transparent to-[#010308]" />

      <Navbar />

      <div className="relative z-10 pt-32 pb-24 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.4em] text-blue-400/70 uppercase mb-4">
            INGRIDEA 2025
          </p>
          <h1 className="font-sans font-black text-white text-5xl sm:text-7xl lg:text-8xl leading-none tracking-tight mb-6">
            EVENTS
          </h1>
          <p className="text-white/50 font-light tracking-widest text-sm sm:text-base max-w-xl mx-auto">
            Two days. Forty-eight hours. Infinite possibilities.
          </p>
        </motion.div>

        {/* Category pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mb-14"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              data-testid={`filter-${cat.toLowerCase()}`}
              className="px-5 py-2 rounded-full text-xs font-semibold tracking-wider text-white/70 border border-white/10 hover:border-blue-500/50 hover:text-blue-300 transition-all cursor-pointer"
              style={{ backdropFilter: "blur(10px)", background: "rgba(255,255,255,0.03)" }}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </motion.div>

        {/* Event cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              data-testid={`card-event-${event.id}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.4, duration: 0.7, ease: "easeOut" }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl overflow-hidden cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Top accent bar */}
              <div
                className="h-0.5 w-full"
                style={{ background: `linear-gradient(90deg, ${event.color}, transparent)` }}
              />

              {/* Glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{
                  boxShadow: `inset 0 0 60px ${event.color}18`,
                  border: `1px solid ${event.color}30`,
                }}
              />

              <div className="p-7">
                <div className="flex items-center justify-between mb-5">
                  <span
                    className="text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-1 rounded-full"
                    style={{
                      color: event.color,
                      background: `${event.color}18`,
                      border: `1px solid ${event.color}30`,
                    }}
                  >
                    {event.category}
                  </span>
                  <span className="text-white/30 text-xs">{event.seats}</span>
                </div>

                <h3 className="font-sans font-black text-white text-2xl sm:text-3xl mb-3 leading-tight">
                  {event.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6">{event.desc}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/30 font-mono">{event.date}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    data-testid={`button-register-${event.id}`}
                    className="px-5 py-2 rounded-full text-xs font-bold tracking-wider text-white transition-all cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${event.color}40, ${event.color}20)`,
                      border: `1px solid ${event.color}50`,
                    }}
                  >
                    REGISTER →
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
