"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  Share2,
  Shield,
  Star,
  X,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://leprive.com.pl";

interface CompanionInfo {
  id: number;
  documentId: string;
  name: string;
  location: string;
  age: string;
  rating: number;
  reviews: number;
  about: string;
  price: number;
  photos?: string[];
  tags?: string[];
  data_cal_link?: string;
  perhour?: string;
  AboutTitle?: string;
  BookAppointment?: string;
  Verified?: string;
  titleBellowButton?: string;
  BookButton?: string;
  perHourText?: string;
  statusInfo?: string;
  backgallery?: string;
  data_cal_namespace?: string;
}

/**
 * Normaliza uma URL de mídia vinda do Strapi:
 * - se começar com http/https retorna como está
 * - senão prefixa com API_URL
 */
function normalizeMediaUrl(u?: string): string | null {
  if (!u) return null;
  return /^https?:\/\//i.test(u) ? u : `${API_URL}${u}`;
}

/**
 * Extrai URLs de mídias de um valor que pode ser:
 * - array de mídias
 * - objeto de mídia única
 * Retorna sempre um array de strings com URLs normalizadas.
 */
function extractMediaUrls(value: any): string[] {
  if (!value) return [];
  const toUrl = (m: any) =>
    normalizeMediaUrl(
      m?.url ||
      m?.formats?.large?.url ||
      m?.formats?.medium?.url ||
      m?.formats?.small?.url ||
      m?.formats?.thumbnail?.url
    );

  if (Array.isArray(value)) {
    return value.map(toUrl).filter(Boolean) as string[];
  }
  const single = toUrl(value);
  return single ? [single] : [];
}

/**
 * Busca 1 companion por documentId e locale.
 * (Mantemos seu endpoint /api/companions sem alterações conceituais.)
 */
async function fetchCompanionInfoByDocumentId(
  documentId: string,
  language: "pl" | "en"
) {
  const url = new URL(`${API_URL}/api/companions`);
  url.searchParams.set("filters[documentId][$eq]", documentId);
  url.searchParams.set("locale", language);
  url.searchParams.set("populate", "*"); // mantemos para garantir campos relacionados

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Erro ao buscar dados da companion");
  const json = await res.json();

  if (!json.data || json.data.length === 0) return null;
  const companion = json.data[0];

  // NÃO montamos mais photos aqui. A galeria virá do endpoint companion-infos.
  return {
    ...companion,
  };
}

/**
 * NOVO: Busca a galeria (array de imagens) no endpoint /api/companion-infos
 * usando nome + locale, exatamente no formato que funcionou no Postman.
 */
async function fetchGalleryByName(name: string, language: "pl" | "en") {
  const url = new URL(`${API_URL}/api/companion-infos`);
  url.searchParams.set("locale", language);
  // publicação ao vivo
  url.searchParams.set("publicationState", "live");
  // filtra por nome correspondente e garante que gallery não seja nulo
  url.searchParams.set("filters[name][$eq]", name);
  url.searchParams.set("filters[gallery][$notNull]", "true");
  // popula somente os campos necessários da galeria (boa prática Strapi v5)
  url.searchParams.set("populate[gallery][fields][0]", "url");
  url.searchParams.set("populate[gallery][fields][1]", "formats");
  url.searchParams.set("populate[gallery][fields][2]", "alternativeText");
  url.searchParams.set("pagination[limit]", "100");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Erro ao buscar galeria");

  const json = await res.json();
  const item = json?.data?.[0];
  const gallery = item?.gallery ?? [];
  const photos = extractMediaUrls(gallery);
  return photos;
}

export default function CompanionProfile() {
  const router = useRouter();
  const params = useParams();

  const documentId = params?.documentId as string | undefined;
  const locale = params?.locale as "pl" | "en" | undefined;

  const [companion, setCompanion] = useState<CompanionInfo | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!documentId || !locale) return;
    fetchCompanionInfoByDocumentId(documentId, locale)
      .then(async (data) => {
        if (!data) throw new Error("Companion not found");

        // 1) seta os dados textuais
        const about = (data as any).description || "";
        setCompanion({
          ...(data as any),
          about,
          photos: [], // começa vazio; vamos preencher com a galeria do outro endpoint
        });

        // 2) busca a galeria pelo NOME + locale no /api/companion-infos
        const name = (data as any)?.name;
        if (name) {
          const photos = await fetchGalleryByName(name, locale);
          setCurrentImageIndex(0);
          setCompanion((prev) =>
            prev ? { ...prev, photos: photos ?? [] } : prev
          );
        }
      })
      .catch(() => {
        alert("Error loading companion data");
        router.push("/");
      });
  }, [documentId, router, locale]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [companion?.photos?.length]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleBookClick = () => {
    if (companion?.data_cal_link) {
      if (isMobile) {
        setIsBookingModalOpen(true);
      } else {
        setIsCardExpanded(!isCardExpanded);
      }
    } else {
      alert("The booking link was not found.");
    }
  };

  const handleAuthModalClose = () => {
    setIsAuthOpen(false);
  };

  if (!companion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-xl">
        Loading...
      </div>
    );
  }
  const defaultBookingName = "Le Privé Sallon";
  const defaultBookingEmail = "noreplyseuprojeto@gmail.com";

  const calIframeUrl = companion.data_cal_link
    ? `https://${companion.data_cal_link}/${companion.data_cal_namespace}?name=${encodeURIComponent(
      defaultBookingName
    )}&email=${encodeURIComponent(defaultBookingEmail)}`
    : null;

  const totalPhotos = companion.photos?.length ?? 0;
  const canNavigate = totalPhotos > 1;

  const goPrev = () => {
    if (!canNavigate) return;
    setCurrentImageIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };
  const goNext = () => {
    if (!canNavigate) return;
    setCurrentImageIndex((prev) => (prev + 1) % totalPhotos);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.history.back()}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </motion.button>
          <h1 className="text-lg md:text-2xl font-bold text-white">
            {companion.backgallery || "Back to Gallery"}
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
          <div className="xl:col-span-2 space-y-6 md:space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-white/5 backdrop-blur-sm rounded-2xl md:rounded-3xl overflow-hidden border border-white/10"
            >
              <div className="relative h-64 md:h-96 lg:h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-900/30 to-pink-900/30 flex items-center justify-center">
                  {totalPhotos > 0 ? (
                    <Image
                      key={companion.photos![currentImageIndex]} // força re-render quando troca o src
                      src={companion.photos![currentImageIndex]}
                      alt={companion.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      priority
                    />
                  ) : (
                    <Camera className="w-12 h-12 md:w-16 md:h-16 text-white/50" />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <motion.button
                  whileHover={{ scale: canNavigate ? 1.1 : 1 }}
                  whileTap={{ scale: canNavigate ? 0.9 : 1 }}
                  onClick={goPrev}
                  disabled={!canNavigate}
                  className={`absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 p-2 md:p-3 rounded-full border transition-all
                    ${canNavigate
                      ? "bg-black/50 border-white/20 hover:bg-black/70"
                      : "bg-black/30 border-white/10 opacity-50 cursor-not-allowed"
                    }
                  `}
                >
                  <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: canNavigate ? 1.1 : 1 }}
                  whileTap={{ scale: canNavigate ? 0.9 : 1 }}
                  onClick={goNext}
                  disabled={!canNavigate}
                  className={`absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 p-2 md:p-3 rounded-full border transition-all
                    ${canNavigate
                      ? "bg-black/50 border-white/20 hover:bg-black/70"
                      : "bg-black/30 border-white/10 opacity-50 cursor-not-allowed"
                    }
                  `}
                >
                  <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </motion.button>

                {totalPhotos > 1 && (
                  <div className="absolute bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 md:gap-2">
                    {companion.photos!.map((_, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${index === currentImageIndex
                            ? "bg-white"
                            : "bg-white/50 hover:bg-white/70"
                          }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                <div className="absolute top-3 md:top-4 right-3 md:right-4 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsLiked(!isLiked)}
                    className="p-1.5 md:p-2 bg-black/50 backdrop-blur-sm rounded-full border border-white/20 hover:bg-black/70 transition-all"
                  >
                    <Heart
                      className={`w-4 h-4 md:w-5 md:h-5 ${isLiked ? "text-rose-400 fill-current" : "text-white"
                        }`}
                    />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 md:p-2 bg-black/50 backdrop-blur-sm rounded-full border border-white/20 hover:bg-black/70 transition-all"
                  >
                    <Share2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </motion.button>
                </div>
              </div>

              <div className="p-4 md:p-6 lg:p-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 md:gap-0 mb-6">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {companion.name}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm md:text-base">
                          {companion.location} • {companion.age}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
                        <span className="font-medium text-sm md:text-base">
                          {companion.rating}
                        </span>
                        <span className="text-slate-400 text-sm">
                          ({companion.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left md:text-right bg-white/5 md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none">
                    <div className="text-2xl md:text-3xl font-bold text-rose-400 mb-1">
                      {companion.price}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {companion.perhour ||
                          companion.perHourText ||
                          "per hour"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {companion.AboutTitle || "About"}
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                      {companion.about}
                    </p>
                  </div>

                  {companion.tags && companion.tags.length > 0 && (
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {companion.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs md:text-sm border border-rose-500/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="hidden lg:block xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                height: isCardExpanded ? "600px" : "auto",
              }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
              className="sticky top-4 bg-gradient-to-r from-rose-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-rose-500/30 overflow-hidden"
            >
              {isCardExpanded && calIframeUrl ? (
                <div className="relative w-full h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white"></h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsCardExpanded(false)}
                      className="p-2 bg-gradient-to-r from-rose-500 to-pink-600 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
                    >
                      <RotateCcw className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>
                  <iframe
                    src={calIframeUrl}
                    className="w-full h-[480px] rounded-xl border-none"
                    allow="camera; microphone; fullscreen"
                    style={{ background: "#111" }}
                  />
                </div>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBookClick}
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-rose-500/25 transition-all"
                  >
                    {companion.BookAppointment ||
                      companion.BookButton ||
                      "Book Appointment"}
                  </motion.button>
                  <div className="mt-4 flex items-center justify-center gap-2 text-green-300">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">
                      {companion.Verified ||
                        companion.titleBellowButton ||
                        "Verified & Secure"}
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent z-30">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBookClick}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-xl font-semibold shadow-lg text-lg"
          >
            {companion.BookAppointment ||
              companion.BookButton ||
              "Book Appointment"}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isBookingModalOpen && calIframeUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsBookingModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/20">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {companion.name}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsBookingModalOpen(false)}
                  className="p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>
              </div>

              <div className="p-4 md:p-6 h-[calc(100%-80px)]">
                <iframe
                  src={calIframeUrl}
                  className="w-full h-full rounded-xl border-none"
                  allow="camera; microphone; fullscreen"
                  style={{ background: "#111" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={handleAuthModalClose}
        language={locale || "pl"}
      />
    </div>
  );
}
