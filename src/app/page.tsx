"use client"; 
import { motion } from "framer-motion";
import NavbarWrapper from "./components/NavbarWrapper";

export default function Home() {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Navbar should be placed outside of the grid to avoid unwanted spacing */}
      <NavbarWrapper />

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <motion.h1
          initial={{ opacity: 0, x: 0, y:-50 ,filter: "blur(5px)" }}
          animate={{ opacity: 1, x: 0, y:0, filter: "blur(0px)" }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="text-4xl font-medium text-center"
        >
          Meetings Made Smarter—Capture, <br/> Analyze, and Act
        </motion.h1>

        <motion.h1
          initial={{ opacity: 0, x: 0,  filter: "blur(30px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="mt-10 text-7xl font-bold text-center"
        >
          Iris
        </motion.h1>
      </div>

      <footer className="p-4 text-center">
        {/* Footer content if needed */}
      </footer>
    </div>
  );
}
