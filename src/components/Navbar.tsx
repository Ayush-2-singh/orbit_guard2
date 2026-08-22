import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Platform" },
  { href: "/capabilities", label: "Capabilities" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 lg:px-12 backdrop-blur-md bg-background/10 border-b border-white/5"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full border-2 border-sky-400 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          </div>
          <span className="font-mono text-lg font-bold tracking-[0.15em] text-white">ORBITGUARD</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 font-sans text-sm tracking-wide text-white/70">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-white transition-all ${location === link.href ? "text-white" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <Link href="/contact">
          <motion.button
            whileHover={{ boxShadow: "0 0 20px rgba(56,189,248,0.4)" }}
            className="hidden md:block px-6 py-2 rounded-full text-sm font-semibold text-white backdrop-blur-xl bg-sky-500/10 border border-sky-400/40 hover:bg-sky-500/20 transition-all cursor-pointer tracking-wider"
          >
            Request Demo
          </motion.button>
        </Link>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Mobile menu panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-[72px] left-0 right-0 z-50 md:hidden"
            >
              <div
                className="mx-4 rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(10,15,30,0.97)",
                  border: "1px solid rgba(56,189,248,0.15)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(56,189,248,0.08)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* Nav links */}
                <div className="p-4 flex flex-col gap-1">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          location === link.href
                            ? "text-white bg-sky-400/10 border border-sky-400/20"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{
                          background: location === link.href ? "#38BDF8" : "rgba(255,255,255,0.2)"
                        }} />
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Divider */}
                <div className="mx-4 h-px bg-white/5" />

                {/* CTA */}
                <div className="p-4">
                  <Link href="/contact" onClick={() => setMobileOpen(false)}>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-3 rounded-xl text-sm font-bold tracking-wider text-white cursor-pointer"
                      style={{
                        background: "rgba(56,189,248,0.12)",
                        border: "1px solid rgba(56,189,248,0.35)",
                      }}
                    >
                      Request Demo
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
