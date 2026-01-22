"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan } from 'lucide-react';

export default function ReceiptScanner() {
  const [isScanning, setIsScanning] = useState(false);

  const startScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000); // Simulate AI processing
  };

  return (
    <div className="w-full">
      <div 
        onClick={startScan}
        className="relative overflow-hidden bg-[#161616] border-2 border-dashed border-[#27272A] rounded-[24px] aspect-video flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-500/50 transition-colors group"
      >
        <AnimatePresence>
          {isScanning && (
            <motion.div 
              initial={{ top: 0 }}
              animate={{ top: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2D5BFF] to-transparent shadow-[0_0_15px_rgba(45,91,255,0.8)] z-10"
            />
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center transition-transform group-hover:scale-105">
          <Scan className={`w-10 h-10 mb-2 ${isScanning ? 'text-[#2D5BFF] animate-pulse' : 'text-zinc-500'}`} />
          <p className="text-zinc-400 font-medium text-sm">
            {isScanning ? "AI Auditor Scanning..." : "Drop receipt or Click to Scan"}
          </p>
        </div>
      </div>
    </div>
  );
}