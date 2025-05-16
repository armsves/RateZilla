'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="block">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center space-x-2"
      >
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg transform rotate-45" />
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
            RZ
          </div>
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Ratezilla
        </span>
      </motion.div>
    </Link>
  );
} 