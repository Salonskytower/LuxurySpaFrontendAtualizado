"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  X,
  Phone,
  Calendar,
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
  reviews: number | null;
  about: any; // Mudou para any pois vem como array de objetos estruturados
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
  phoneNumber?: string; // Novo campo da API
  language?: Array<{ id: number; label: string }>; // Novo campo da API
  service?: Array<{ id: number; label: string }>; // Novo campo da API
  contactLinks?: Array<{ // Novo campo da API
    id: number;
    whatsapp: string;
    callNow: string;
    telegram: string;
  }>;
}

/**
 * Converte o campo about (array estruturado) em texto simples
 */
function convertAboutToText(aboutArray: any): string {
  if (!aboutArray || !Array.isArray(aboutArray)) return "";
  
  return aboutArray
    .map((paragraph: any) => {
      if (paragraph.children && Array.isArray(paragraph.children)) {
        return paragraph.children
          .map((child: any) => child.text || "")
          .join("");
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
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
 * NOVO: Busca todos os dados da companion no endpoint /api/companion-infos
 * usando nome + locale, incluindo galeria e todos os textos.
 */
async function fetchCompanionInfosByName(name: string, language: "pl" | "en") {
  const url = new URL(`${API_URL}/api/companion-infos`);
  url.searchParams.set("locale", language);
  // publicação ao vivo
  url.searchParams.set("publicationState", "live");
  // filtra por nome correspondente
  url.searchParams.set("filters[name][$eq]", name);
  // popula todos os campos necessários
  url.searchParams.set("populate", "*");
  url.searchParams.set("pagination[limit]", "100");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Erro ao buscar dados da companion-info");

  const json = await res.json();
  const item = json?.data?.[0];
  
  if (!item) return { photos: [], companionInfo: null };
  
  const gallery = item?.gallery ?? [];
  const photos = extractMediaUrls(gallery);
  
  return { 
    photos, 
    companionInfo: item 
  };
}

export default function CompanionProfile() {
  const router = useRouter();
  const params = useParams();

  const documentId = params?.documentId as string | undefined;
  const locale = params?.locale as "pl" | "en" | undefined;

  const [companion, setCompanion] = useState<CompanionInfo | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    if (!documentId || !locale) return;
    fetchCompanionInfoByDocumentId(documentId, locale)
      .then(async (data) => {
        if (!data) throw new Error("Companion not found");

        // 1) busca todos os dados da companion-info pelo NOME + locale
        const name = (data as any)?.name;
        if (name) {
          const { photos, companionInfo } = await fetchCompanionInfosByName(name, locale);
          
          // 2) combina os dados do /api/companions com os da /api/companion-infos
          const combinedData = {
            ...(data as any),
            // Sobrescreve com dados da companion-info quando disponíveis
            ...(companionInfo || {}),
            about: companionInfo?.about ? convertAboutToText(companionInfo.about) : (data as any).description || "",
            photos: photos ?? [],
          };
          
          setCompanion(combinedData);
          setCurrentImageIndex(0);
        } else {
          // Fallback se não tiver nome
          const about = (data as any).description || "";
          setCompanion({
            ...(data as any),
            about,
            photos: [],
          });
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


  const handleBookClick = () => {
    if (companion?.data_cal_link) {
      setIsBookingModalOpen(true);
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
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header com botão de voltar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.history.back()}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </motion.button>
          <h1 className="text-xl font-semibold text-white">
            {companion.backgallery || "Powrót do Galerii"}
          </h1>
        </motion.div>

        {/* Layout principal - Card único */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-sm"
        >
          {/* Conteúdo principal em layout horizontal */}
          <div className="flex flex-col lg:flex-row">
            {/* Seção da imagem - lado esquerdo */}
            <div className="lg:w-1/2 relative">
              <div className="relative h-64 lg:h-96 bg-gradient-to-br from-rose-900/30 to-pink-900/30 flex items-center justify-center border-r border-white/10">
                {totalPhotos > 0 ? (
                  <Image
                    key={companion.photos![currentImageIndex]}
                    src={companion.photos![currentImageIndex]}
                    alt={companion.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  /* Placeholder com retângulo e linhas diagonais como na imagem */
                  <div className="relative w-full h-full bg-gradient-to-br from-rose-900/30 to-pink-900/30 flex items-center justify-center">
                    <div className="w-full h-full relative border-2 border-white/20">
                      {/* Linhas diagonais formando um X */}
                      <div className="absolute inset-0">
                        <div className="absolute w-full h-0.5 bg-white/50 transform rotate-45 top-1/2 left-0 origin-center"></div>
                        <div className="absolute w-full h-0.5 bg-white/50 transform -rotate-45 top-1/2 left-0 origin-center"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navegação de imagens */}
                {totalPhotos > 1 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={goPrev}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 rounded-full border border-white/20 hover:bg-black/70 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={goNext}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 rounded-full border border-white/20 hover:bg-black/70 transition-all"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </motion.button>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {companion.photos!.map((_, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex
                              ? "bg-white"
                              : "bg-white/50 hover:bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Seção de informações - lado direito */}
            <div className="lg:w-1/2 p-6 lg:p-8">
              {/* Nome */}
              <h1 className="text-3xl font-bold text-white mb-2">
                {companion.name}
              </h1>

              {/* Localização e idade */}
              <div className="flex items-center gap-1 text-slate-300 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-base">
                  {companion.location} • {companion.age}
                </span>
              </div>

              {/* Avaliações */}
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-5 h-5 text-yellow-400 fill-current" 
                  />
                ))}
                <span className="ml-2 text-slate-300">
                  ({companion.reviews || 0} {locale === "pl" ? "recenzji" : "reviews"})
                </span>
              </div>

              {/* Preço */}
              <div className="mb-8">
                <div className="text-4xl font-bold text-rose-400 mb-1">
                  {companion.price} PLN
                </div>
                <div className="text-slate-300">
                  {companion.perHourText || (locale === "pl" ? "/ na godzinę" : "/ per hour")}
                </div>
              </div>

              {/* Botões de ação */}
              <div className="space-y-3 mb-8">
                {/* Botão de telefone */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 hover:bg-white/20 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  {companion.phoneNumber || (locale === "pl" ? "Zadzwoń teraz: 48 665 564 549" : "Call now: +48 665 564 549")}
                </motion.button>

                {/* Botão de reserva */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBookClick}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 hover:shadow-rose-500/25 transition-all shadow-lg"
                >
                  <Calendar className="w-5 h-5" />
                  {companion.BookButton || (locale === "pl" ? "Zarezerwuj online" : "Book Now")}
                </motion.button>
                
                {/* Texto de verificação */}
                {companion.titleBellowButton && (
                  <div className="text-center">
                    <span className="text-sm text-slate-400">
                      {companion.titleBellowButton}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seção "Sobre" na parte inferior */}
          <div className="px-6 lg:px-8 pb-6 lg:pb-8 border-t border-white/10">
            <div className="pt-6">
              <p className="text-slate-300 leading-relaxed text-base">
                {companion.about || ""}
              </p>
            </div>

            {/* Tags se existirem */}
            {companion.tags && companion.tags.length > 0 && (
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {companion.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-sm border border-rose-500/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Serviços se existirem */}
            {companion.service && companion.service.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {locale === "pl" ? "Usługi" : "Services"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {companion.service.map((service) => (
                    <span
                      key={service.id}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                    >
                      {service.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Idiomas se existirem */}
            {companion.language && companion.language.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {locale === "pl" ? "Języki" : "Languages"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {companion.language.map((lang) => (
                    <span
                      key={lang.id}
                      className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30"
                    >
                      {lang.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal de reserva para mobile */}
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
              className="relative w-full max-w-4xl h-full max-h-[90vh] bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <h2 className="text-xl font-bold text-white">
                  {companion.BookAppointment || companion.name}
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

              <div className="p-6 h-[calc(100%-80px)]">
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
