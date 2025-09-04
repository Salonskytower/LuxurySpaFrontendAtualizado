"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  {
    id: 1,
    src: "/WhatsApp%20Image%202025-06-02%20at%2017.41.38%20(1).jpeg",
    alt: "Luxury spa environment",
    caption: "Luxurious Atmosphere",
  },
  {
    id: 2,
    src: "/WhatsApp%20Image%202025-06-02%20at%2017.41.38.jpeg",
    alt: "Elegant massage room",
    caption: "Premium Experience",
  },
  {
    id: 3,
    src: "/WhatsApp%20Image%202025-06-02%20at%2017.41.39%20(1).jpeg",
    alt: "Spa jacuzzi area",
    caption: "Exclusive Facilities",
  },
  {
    id: 4,
    src: "/WhatsApp%20Image%202025-06-02%20at%2017.41.39%20(2).jpeg",
    alt: "Wellness sanctuary",
    caption: "Intimate Setting",
  },
  {
    id: 5,
    src: "/WhatsApp%20Image%202025-06-02%20at%2017.41.39.jpeg",
    alt: "Luxury wellness center",
    caption: "Sophisticated Ambiance",
  },
  {
    id: 6,
    src: "/WhatsApp%20Image%202025-06-02%20at%2017.41.40.jpeg",
    alt: "Luxury wellness center",
    caption: "Sophisticated Ambiance",
  },
];
interface ImageCarouselSectionProps {
  language: "pl" | "en";
}
export default function ImageCarouselSection({
  language,
}: ImageCarouselSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [galleryButton, setGalleryButton] = useState({
    icon: "",
    text: "",
    subtitle: "",
  });
  const [slideTexts, setSlideTexts] = useState<
    { id: number; title: string; description: string }[]
  >([]);
  const [facilities, setFacilities] = useState<
    { id: number; icon: string; title: string; description: string }[]
  >([]);

  const [facilitiesIntro, setFacilitiesIntro] = useState({
    title: "",
    description: "",
  });

  const [privateEnvironmentButton, setPrivateEnvironmentButton] = useState({
    icon: "",
    text: "",
  });

  const [heroGallery, setHeroGallery] = useState({
    highlight: "",
    titleAccent: "",
    description: "",
  });

  useEffect(() => {
    fetch(
      `https://leprive.com.pl/api/gallery-content?populate[galleryButton]=true&populate[heroGalleryInfo]=true&populate[slides]=true&populate[facilities]=true&populate[facilitiesIntro]=true&populate[privateEnvironmentButton]=true&locale=${language}`
    )
      .then((res) => res.json())
      .then((json) => {
        const data = json?.data;
        if (data?.galleryButton) {
          setGalleryButton({
            icon: data.galleryButton.icon,
            text: data.galleryButton.text,
            subtitle: data.galleryButton.subtitle ?? "",
          });
        }

        if (Array.isArray(data?.slides)) {
          setSlideTexts(data.slides);
        }
        if (
          Array.isArray(data?.heroGalleryInfo) &&
          data.heroGalleryInfo.length > 0
        ) {
          const info = data.heroGalleryInfo[0];
          setHeroGallery({
            highlight: info.highlight,
            titleAccent: info.titleAccent,
            description: info.description,
          });
        }
        if (Array.isArray(data?.facilities)) {
          setFacilities(data.facilities);
        }

        if (data?.facilitiesIntro) {
          setFacilitiesIntro({
            title: data.facilitiesIntro.title,
            description: data.facilitiesIntro.description,
          });
        }

        if (data?.privateEnvironmentButton) {
          setPrivateEnvironmentButton({
            icon: data.privateEnvironmentButton.icon,
            text: data.privateEnvironmentButton.text,
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch gallery content:", err);
      });
  }, [language]);

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 8000);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 8000);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 8000);
  };

  // Funções do Lightbox
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    setIsAutoPlay(false);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setIsAutoPlay(true);
  };

  const nextLightboxImage = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevLightboxImage = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Fechar lightbox com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        prevLightboxImage();
      } else if (e.key === "ArrowRight") {
        nextLightboxImage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

  // Prevenir scroll quando lightbox está aberto
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLightboxOpen]);

  return (
    <>
      <section className="py-20 bg-gradient-to-b from-slate-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-rose-500 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <span className="text-2xl">{galleryButton.icon}</span>
              <span className="text-white/90 font-medium">
                {galleryButton.text}
              </span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              {heroGallery.highlight}{" "}
              <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                {heroGallery.titleAccent}
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              {heroGallery.description}
            </p>
          </div>

          <div className="relative">
            <div className="relative h-[600px] rounded-3xl overflow-hidden bg-black/20 backdrop-blur-sm border border-white/10">
              <div
                className="flex transition-transform duration-700 ease-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="w-full flex-shrink-0 relative cursor-pointer"
                    onClick={() => openLightbox(currentIndex)}
                  >
                    <Image
                      width={1000}
                      height={1000}
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                    <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {slideTexts[index]?.title ?? ""}
                        </h3>
                        <p className="text-slate-300">
                          {slideTexts[index]?.description ?? ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
              >
                <span className="text-xl">‹</span>
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
              >
                <span className="text-xl">›</span>
              </button>

              <div className="absolute top-6 right-6">
                <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8 gap-3">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-rose-500 w-8"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-12">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToSlide(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  index === currentIndex
                    ? "border-rose-500 scale-105"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                <Image
                  width={1000}
                  height={1000}
                  src={image.src}
                  alt={image.alt}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    hoveredIndex === index ? "scale-110" : ""
                  }`}
                />
                <div
                  className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
                    index === currentIndex
                      ? "opacity-0"
                      : "opacity-60 hover:opacity-40"
                  }`}
                />

                {index === currentIndex && (
                  <div className="absolute inset-0 border-2 border-rose-500 rounded-xl">
                    <div className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                {facilitiesIntro.title}
              </h3>
              <p className="text-slate-300 mb-6">
                {facilitiesIntro.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {facilities.map((item) => (
                  <div key={item.id} className="text-center">
                    <span className="text-3xl mb-2 block">{item.icon}</span>
                    <h4 className="text-white font-semibold mb-1">
                      {item.title}
                    </h4>
                    <p className="text-slate-400 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500/10 backdrop-blur-sm rounded-full border border-rose-500/20">
              <span className="text-rose-400">
                {privateEnvironmentButton.icon}
              </span>
              <span className="text-rose-300 font-medium">
                {privateEnvironmentButton.text}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
            onClick={closeLightbox}
          >
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Botão Fechar */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={closeLightbox}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </motion.button>

              {/* Contador */}
              <div className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                {lightboxIndex + 1} / {images.length}
              </div>

              {/* Botão Anterior */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => {
                  prevLightboxImage();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>

              {/* Botão Próximo */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => {
                  nextLightboxImage();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>

              {/* Imagem */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative max-w-[90vw] max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  width={1200}
                  height={1200}
                  src={images[lightboxIndex].src}
                  alt={images[lightboxIndex].alt}
                  className="w-full h-full object-contain rounded-lg"
                />

                {/* Caption */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-center py-4 px-6 rounded-b-lg"
                >
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {slideTexts[lightboxIndex]?.title ??
                      images[lightboxIndex].caption}
                  </h3>
                  {slideTexts[lightboxIndex]?.description && (
                    <p className="text-slate-300 text-sm">
                      {slideTexts[lightboxIndex].description}
                    </p>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
