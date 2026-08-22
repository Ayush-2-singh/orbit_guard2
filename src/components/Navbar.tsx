import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 lg:px-12 backdrop-blur-md bg-background/10 border-b border-white/5"
    >
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full border-2 border-sky-400 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
        </div>
        <span className="font-mono text-lg font-bold tracking-[0.15em] text-white">ORBITGUARD</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 font-sans text-sm tracking-wide text-white/70">
        <Link href="/" className="hover:text-white transition-all">Platform</Link>
        <Link href="/capabilities" className="hover:text-white transition-all">Capabilities</Link>
        <Link href="/dashboard" className="hover:text-white transition-all">Dashboard</Link>
        <Link href="/contact" className="hover:text-white transition-all">Contact</Link>
      </div>

      <motion.button
        whileHover={{ boxShadow: "0 0 20px rgba(56,189,248,0.4)" }}
        className="px-6 py-2 rounded-full text-sm font-semibold text-white backdrop-blur-xl bg-sky-500/10 border border-sky-400/40 hover:bg-sky-500/20 transition-all cursor-pointer tracking-wider"
      >
        Request Demo
      </motion.button>
    </motion.nav>
  );
}
