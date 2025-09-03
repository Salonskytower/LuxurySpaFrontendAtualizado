"use client";

import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchFromStrapi } from "../lib/api";
import Image from "next/image";
interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  premiumExperienceText: string;
  browseButtonText: string;
  learnMoreButtonText: string;
  language: "pl" | "en";
}

interface HeroSectionProps {
  language: "pl" | "en";
}

export default function HeroSection({ language }: HeroSectionProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [content, setContent] = useState<HeroContent>({
    title: "",
    subtitle: "",
    description: "",
    premiumExperienceText: "",
    browseButtonText: "",
    learnMoreButtonText: "",
    language: language,
  });

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });

    const fetchContent = async () => {
      try {
        const res = await fetchFromStrapi(
          `/api/hero-section-content?locale=${language}`
        );
        if (res) setContent(res);
      } catch (error) {
        console.error("Erro ao buscar hero-section-content:", error);
      }
    };

    fetchContent();
  }, [language]);

  return (
    <div
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        {!isVideoLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900 animate-pulse" />
        )}

        <video
          autoPlay
          muted
          loop
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoadedData={() => setIsVideoLoaded(true)}
        >
          <source src="/heroVideo.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      <div className="absolute inset-0 z-10">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
            }}
            animate={{
              y: [null, -20, 20],
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-20 text-center px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
          >
            <Sparkles className="w-5 h-5 text-rose-300" />
            <span className="text-white/90 font-medium">
              {content.premiumExperienceText}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="flex justify-center mb-8"
          >
            <Image
              src="/Logo LE PRIVE - white.png"
              alt="Le Privê Logo"
              width={400}
              height={160}
              className="h-32 md:h-40 w-auto"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed"
          >
            {content.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full font-semibold text-lg shadow-2xl hover:shadow-rose-500/25 transition-all duration-300"
              onClick={() => (window.location.href = "#companions")}
            >
              <span className="flex items-center gap-2">
                {content.browseButtonText}
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Play className="w-5 h-5" />
                </motion.div>
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-full font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
              onClick={() => (window.location.href = "#how-it-works")}
            >
              {content.learnMoreButtonText}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
