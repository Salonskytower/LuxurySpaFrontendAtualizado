"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, Star, MapPin, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { companionsApi, contentApi } from "@/lib/api";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://leprive.com.pl";

interface Companion {
  id: number;
  documentId: string;
  name: string;
  age: string;
  location: string;
  rating: number;
  reviews: number;
  price: string;
  tags: string[];
  availability: "Available" | "Busy" | "Unavailable" | "Checking...";
  description: string;
  image?: string;
  likes: number;
}

interface CompanionsGalleryProps {
  language: "pl" | "en";
}

interface ApiCompanion {
  id: number;
  documentId: string;
  name: string;
  age: string | number;
  location: string;
  rating?: number;
  reviews?: number;
  price: string;
  specialty?: Array<{ label: string }>;
  statusInfo?: string;
  description?: string;
  event_type_id?: string;
  likes?: number;
  image?: any; // vindo direto do Strapi (array/obj de mídias ou null)
}

interface GalleryContent {
  title: string;
  subtitle: string;
  viewAllButtonText: string;
  bookNowButtonText?: string;
  hideAllButtonText?: string; // <- novo: texto para "Ocultar todas as massagistas"
}

export default function CompanionsGallery({ language }: CompanionsGalleryProps) {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const [galleryContent, setGalleryContent] = useState<GalleryContent>({
    title: "",
    subtitle: "",
    viewAllButtonText: "",
    bookNowButtonText: undefined,
    hideAllButtonText: "", // <- novo
  });

  const likeCompanion = async (documentId: string) => {
    const idx = companions.findIndex((c) => c.documentId === documentId);
    if (idx === -1) return;

    const updated = [...companions];
    updated[idx] = { ...updated[idx], likes: updated[idx].likes + 1 };

    setCompanions([...updated].sort((a, b) => b.likes - a.likes));

    try {
      await companionsApi.likeCompanion(documentId);
    } catch (error) {
      // Reverter mudança se der erro
      updated[idx] = { ...updated[idx], likes: updated[idx].likes - 1 };
      setCompanions([...updated].sort((a, b) => b.likes - a.likes));
      console.error("Erro ao dar like:", error);
    }
  };

  function getCompanionStatus(
    availabilitySlots: any
  ): "Available" | "Busy" | "Unavailable" {
    if (
      !availabilitySlots ||
      typeof availabilitySlots !== "object" ||
      Object.keys(availabilitySlots).length === 0
    )
      return "Unavailable";
    const today = new Date().toISOString().slice(0, 10);
    const nextThreeDays = Array.from({ length: 3 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
    if (
      nextThreeDays.some(
        (day) =>
          Array.isArray(availabilitySlots[day]) &&
          availabilitySlots[day].length > 0
      )
    ) {
      return "Available";
    }
    const futureDates = Object.keys(availabilitySlots).filter(
      (date) => date > today
    );
    if (
      futureDates.some(
        (date) =>
          Array.isArray(availabilitySlots[date]) &&
          availabilitySlots[date].length > 0
      )
    ) {
      return "Busy";
    }
    return "Unavailable";
  }

  async function fetchData() {
    try {
      const json = await companionsApi.getCompanions({
        locale: language,
        sort: "likes:desc",
        withImage: true,
      });

      const companionsBase = (json?.data || []) as ApiCompanion[];

      // ✅ OTIMIZAÇÃO: Carregar companions primeiro, availability depois
      const companionsWithStatus: Companion[] = companionsBase.map((c) => {
        const tags = (c.specialty || []).map((t) => t.label);
        const description = c.description || "";

        // ✅ Começar com "Checking..." e atualizar depois
        const availability: "Available" | "Busy" | "Unavailable" | "Checking..." = "Checking...";

        // ---- IMAGEM: pega a primeira mídia e monta URL absoluta
        const raw = c.image;
        let imageUrl = "";

        if (Array.isArray(raw) && raw.length > 0) {
          const first = raw[0];
          const candidate =
            first?.formats?.medium?.url ||
            first?.formats?.small?.url ||
            first?.url;
          if (candidate) {
            imageUrl = candidate.startsWith("http")
              ? candidate
              : `${API_URL}${candidate}`;
          }
        } else if (raw?.data) {
          // caso o Strapi devolva como { data: [...] }
          const arr = Array.isArray(raw.data) ? raw.data : [raw.data];
          const first = arr[0]?.attributes;
          const candidate =
            first?.formats?.medium?.url ||
            first?.formats?.small?.url ||
            first?.url;
          if (candidate) {
            imageUrl = candidate.startsWith("http")
              ? candidate
              : `${API_URL}${candidate}`;
          }
        }

        return {
          id: c.id,
          documentId: c.documentId,
          name: c.name,
          age:
            typeof c.age === "string"
              ? c.age.replace(/\D/g, "")
              : typeof c.age === "number"
                ? String(c.age)
                : "",
          location: c.location,
          rating: c.rating ?? 0,
          reviews: c.reviews ?? 0,
          price: `zł ${c.price}/H`,
          tags: tags.slice(0, 3),
          availability,
          description,
          image: imageUrl,
          likes: c.likes ?? 0,
        };
      });

      // ✅ Filtrar companions com imagens e mostrar imediatamente
      const validCompanions = companionsWithStatus.filter((c) => !!c.image);
      setCompanions(validCompanions);

      // ✅ OTIMIZAÇÃO: Carregar availability em background (sem bloquear UI)
      validCompanions.forEach(async (companion, index) => {
        if (companion.id && String(companionsBase[index]?.event_type_id).match(/^\d+$/)) {
          try {
            const slotsJson = await companionsApi.getCompanionAvailability(companionsBase[index].event_type_id!);
            const newAvailability = getCompanionStatus(slotsJson.availability_slots);
            
            // ✅ Atualizar apenas este companion específico
            setCompanions(prev => prev.map(c => 
              c.documentId === companion.documentId 
                ? { ...c, availability: newAvailability }
                : c
            ));
          } catch {
            // ✅ Se der erro, marcar como Unavailable
            setCompanions(prev => prev.map(c => 
              c.documentId === companion.documentId 
                ? { ...c, availability: "Unavailable" as const }
                : c
            ));
          }
        } else {
          // ✅ Se não tem event_type_id válido, marcar como Unavailable
          setCompanions(prev => prev.map(c => 
            c.documentId === companion.documentId 
              ? { ...c, availability: "Unavailable" as const }
              : c
          ));
        }
      });
    } catch (error) {
      console.error("Failed to load companions:", error);
    }
  }

  async function fetchGalleryContent() {
    try {
      const data = await contentApi.getCompanionsGalleryContent(language);
      if (data) {
        // Fallback coerente caso o CMS não traga explicitamente "Ocultar"
        const derivedHide =
          (data.viewAllButtonText || "")
            .replace(/^Pokaż/i, "Ukryj")
            .replace(/^Show/i, "Hide");

        setGalleryContent({
          title: data.title?.trim() || galleryContent.title,
          subtitle: data.subtitle?.trim() || galleryContent.subtitle,
          viewAllButtonText:
            data.viewAllButtonText?.trim() || galleryContent.viewAllButtonText,
          bookNowButtonText: data.bookNowButtonText?.trim() || "Book Now",
          hideAllButtonText:
            (data.OcultarMassagistas?.trim?.() || derivedHide || galleryContent.hideAllButtonText || "").trim(),
        });
      }
    } catch (error) {
      console.error("Failed to load gallery content:", error);
    }
  }

  useEffect(() => {
    fetchData();
    fetchGalleryContent();
    // eslint-disable-next-line
  }, [
    language,
    galleryContent.title,
    galleryContent.subtitle,
    galleryContent.viewAllButtonText,
  ]);

  const companionsToDisplay = isExpanded ? companions : companions.slice(0, 3);

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {galleryContent.title}
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {galleryContent.subtitle}
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {companionsToDisplay.map((companion, index) => (
            <motion.div
              key={companion.documentId}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              onHoverStart={() => setHoveredCard(companion.documentId)}
              onHoverEnd={() => setHoveredCard(null)}
              className="group relative"
            >
              <Link
                href={`/companion/${language}/${companion.documentId}`}
                className="relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-rose-500/50 transition-all duration-500 cursor-pointer h-full flex flex-col"
              >
                <div className="relative h-80 overflow-hidden">
                  {companion.image ? (
                    <>
                      <Image
                        src={companion.image}
                        alt={companion.name}
                        fill
                        className={`object-cover transition-transform duration-500 ${
                          hoveredCard === companion.documentId
                            ? "scale-110"
                            : "scale-100"
                        }`}
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={{
                          scale: hoveredCard === companion.documentId ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.6 }}
                        className="w-full h-full bg-gradient-to-br from-rose-900/50 to-pink-900/50"
                      >
                        <div className="absolute inset-0 flex items-center justify-center text-white/50">
                          <Eye className="w-12 h-12" />
                        </div>
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </>
                  )}

                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        companion.availability === "Available"
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : companion.availability === "Checking..."
                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 animate-pulse"
                          : "bg-red-500/20 text-red-300 border border-red-500/30"
                      } backdrop-blur-sm`}
                    >
                      {companion.availability}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      likeCompanion(companion.documentId);
                    }}
                    className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded-full border border-white/20 hover:bg-black/50 transition-all z-10"
                  >
                    <Heart className="w-5 h-5 text-rose-400 fill-current" />
                    <span className="ml-1 text-white text-xs">
                      {companion.likes}
                    </span>
                  </motion.button>

                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white text-sm font-medium">
                        {companion.rating}
                      </span>
                      <span className="text-white/60 text-xs">
                        ({companion.reviews})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {companion.name}
                      </h3>
                      <div className="flex items-center gap-1 text-slate-300 text-sm">
                        <MapPin className="w-4 h-4" />
                        {companion.location} • {companion.age} lata
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-rose-400 font-bold text-lg">
                        {companion.price}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed h-10 overflow-hidden">
                    {companion.description}
                  </p>
                  <div className="flex flex-wrap gap-2 h-8 overflow-hidden">
                    {(companion.tags || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-full border border-white/20"
                      >
                        {tag}
                      </span>
                    ))}
                    </div>
                    <Link
                    href={`/companion/${language}/${companion.documentId}`}
                    className="w-full text-center bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 mt-auto"
                  >
                    {galleryContent.bookNowButtonText || "Book Now"}
                  </Link>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            {isExpanded
              ? (galleryContent.hideAllButtonText ||
                galleryContent.viewAllButtonText)
              : galleryContent.viewAllButtonText}
          </motion.button>
        </motion.div>
      </div>
      {/* AuthModal não será mais utilizado aqui */}
    </section>
  );
}
