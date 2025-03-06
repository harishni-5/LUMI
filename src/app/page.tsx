"use client"; 
import { motion } from "framer-motion";
import NavbarWrapper from "./components/NavbarWrapper";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar should be placed outside of the grid to avoid unwanted spacing */}
      <NavbarWrapper />

      <div className="grid flex-1 grid-rows-[1fr_20px] items-start justify-items-start p-8 pb-20 gap-16 sm:p-20 font-[var(--font-inter)]">
        <main className="flex flex-col items-start justify-start">

          <motion.h1
            initial={{ opacity: 0, x: 0, y:-50 ,filter: "blur(5px)" }}
            animate={{ opacity: 1, x: 0, y:0, filter: "blur(0px)" }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="mt-10 ml-1 text-4xl font-medium text-left"
          >
          
          Meetings Made Smarter—Capture, <br/> Analyze, and Act
          
          </motion.h1>

          <motion.h1
            initial={{ opacity: 0, x: 0,  filter: "blur(30px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="mt-10 ml-1 text-7xl font-bold text-center"
          >
            Iris
          </motion.h1>
        </main>
































      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        
      </footer>
    </div>
    </div>
  );
}
