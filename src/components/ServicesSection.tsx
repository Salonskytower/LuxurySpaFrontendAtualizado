"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface MassageContent {
  title: string;
  subtitle: string;
  priceListLabel: string;
  professionalBadge?: BadgeInfo; // <- novo
}
interface MassagePackage {
  duration: string;
  price: string;
  notes?: string | null;
}
interface PartyCard {
  title?: string;
  price?: string;
  note?: string;
  icon?: { url: string } | null;
  features?: { name: string; apiid?: string }[];
}

interface SpecialOption {
  id: number;
  name: string;
  price: string;
  note?: string | null;
  sectionTitle?: string;
}
interface BadgeInfo {
  icon: string;
  text: string;
}
interface MassageService {
  id: number;
  name: string;
  description: string;
  packages: MassagePackage[];
  icon: string;
  popular: boolean;
  color: string;
  borderColor: string;
  tag?: string;
  buttonText?: string;
}
interface JacuzziPackage {
  duration: string;
  price: string;
}

interface JacuzziService {
  id: number;
  title: string;
  packages: JacuzziPackage[];
}
interface ExtraCard {
  id: number;
  title: string;
  description: string;
  price?: string | null;
  note?: string | null;
  icon?: {
    url: string;
  } | null;
}
interface MassageServicesSectionProps {
  language: "pl" | "en";
}

export default function MassageServicesSection({
  language,
}: MassageServicesSectionProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [content, setContent] = useState<MassageContent>({
    title: "",
    subtitle: "",
    priceListLabel: "",
  });
  const [massageServices, setMassageServices] = useState<MassageService[]>([]);
  const [extraCards, setExtraCards] = useState<ExtraCard[]>([]);
  const [jacuzziServices, setJacuzziServices] = useState<JacuzziService[]>([]);
  const [specialOptions, setSpecialOptions] = useState<SpecialOption[]>([]);
  const [jacuzziSectionTitle, setJacuzziSectionTitle] = useState("");
  const [partyCard, setPartyCard] = useState<PartyCard | null>(null);
  const [specialOptionsSectionTitle, setSpecialOptionsSectionTitle] =
    useState("");

  useEffect(() => {
    fetch(
      `https://api.leprive.fun/api/massage-services-content?populate[massageCards][populate][options]=true&populate[extraCards][populate]=icon&populate[jacuzziServices][populate]=packages&populate[specialOptions]=true&populate[professionalBadge]=true&populate[partyCard][populate]=features&locale=${language}`
    )
      .then((res) => res.json())
      .then((json) => {
        const data = json?.data;
        if (data) {
          setContent({
            title: data.title || "",
            subtitle: data.subtitle || "",
            priceListLabel: data.priceListLabel || "",
            professionalBadge: data.professionalBadge,
          });
          // PARTY CARD
          if (data.partyCard) {
            setPartyCard({
              title: data.partyCard.title ?? "",
              price: data.partyCard.price ?? "",
              note: data.partyCard.note ?? "",
              icon: data.partyCard.icon
                ? { url: data.partyCard.icon.url }
                : null,
              features: (data.partyCard.features ?? []).map((f: any) => ({
                name: f.name,
                apiid: f.apiid,
              })),
            });
          }

          interface MassageCardApi {
            id: number;
            title: string;
            description: string;
            tag?: string;
            buttonText?: string;
            options?: {
              duration: string;
              price: string;
              notes?: string | null;
            }[];
          }

          const mappedServices = (data.massageCards || []).map(
            (card: MassageCardApi, index: number): MassageService => ({
              id: card.id,
              name: card.title,
              description: card.description,
              tag: card.tag || "",
              packages: (card.options || []).map((opt) => ({
                duration: opt.duration,
                price: opt.price,
                notes: opt.notes,
              })),
              icon: ["💖", "💎", "👑"][index] || "💆",
              popular:
                card.tag?.toLowerCase().includes("najpopularniejsze") || false,
              color:
                [
                  "from-rose-500 to-pink-600",
                  "from-purple-500 to-indigo-600",
                  "from-amber-500 to-yellow-600",
                ][index] || "from-slate-500 to-slate-600",
              borderColor:
                [
                  "border-rose-400/50",
                  "border-purple-400/50",
                  "border-amber-400/50",
                ][index] || "border-slate-400/50",
              buttonText: card.buttonText || "",
            })
          );

          const mappedExtraCards = (data.extraCards || []).map(
            (card: {
              id: number;
              title: string;
              description: string;
              price?: string | null;
              note?: string | null;
              icon?: { url: string } | null;
            }): ExtraCard => ({
              id: card.id,
              title: card.title,
              description: card.description,
              price: card.price || null,
              note: card.note || null,
              icon: card.icon?.url ? { url: card.icon.url } : null,
            })
          );
          interface JacuzziServiceApi {
            id: number;
            title: string;
            packages?: {
              duration: string;
              price: string;
            }[];
          }

          const mappedJacuzziServices = (data.jacuzziServices || []).map(
            (service: JacuzziServiceApi): JacuzziService => ({
              id: service.id,
              title: service.title,
              packages: (service.packages || []).map((p) => ({
                duration: p.duration,
                price: p.price,
              })),
            })
          );
          const mappedSpecialOptions = (data.specialOptions || []).map(
            (option: {
              id: number;
              name: string;
              price: string;
              note?: string | null;
              sectionTitle?: string;
            }): SpecialOption => ({
              id: option.id,
              name: option.name,
              price: option.price,
              note: option.note || null,
              sectionTitle: option.sectionTitle,
            })
          );
          setSpecialOptions(mappedSpecialOptions);
          if (
            data.specialOptions?.length > 0 &&
            data.specialOptions[0].sectionTitle
          ) {
            setSpecialOptionsSectionTitle(data.specialOptions[0].sectionTitle);
          }
          if (
            data.jacuzziServices?.length > 0 &&
            data.jacuzziServices[0].sectionTitle
          ) {
            setJacuzziSectionTitle(data.jacuzziServices[0].sectionTitle);
          }
          setMassageServices(mappedServices);
          setExtraCards(mappedExtraCards);
          setJacuzziServices(mappedJacuzziServices);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch massage content:", err);
      });
  }, [language]);

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-500 rounded-full filter blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <span className="text-2xl">✨</span>
            <span className="text-white/90 font-medium">
              {content.priceListLabel}
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {content.title.split(" ")[0]}{" "}
            <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
              {content.title.split(" ").slice(1).join(" ")}
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {content.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {massageServices.map((service) => (
            <div
              key={service.id}
              onMouseEnter={() => setHoveredCard(service.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative"
            >
              {service.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    {service.tag}
                  </div>
                </div>
              )}

              <div
                className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border ${
                  service.borderColor
                } hover:border-rose-500/50 transition-all duration-500 h-full flex flex-col transform ${
                  hoveredCard === service.id ? "scale-105 -translate-y-2" : ""
                }`}
              >
                <div className="text-center mb-8">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${
                      service.color
                    } rounded-full mb-4 transform ${
                      hoveredCard === service.id ? "rotate-12" : ""
                    } transition-transform duration-300`}
                  >
                    <span className="text-2xl">{service.icon}</span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">
                    {service.name}
                  </h3>
                  <p className="text-slate-300 text-sm mb-6">
                    {service.description}
                  </p>
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  {service.packages.map((pkg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">⏰</span>
                        <span className="text-white font-medium">
                          {pkg.duration}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-rose-400 font-bold">
                          {pkg.price}
                        </span>
                        {pkg.notes && (
                          <div className="text-xs text-slate-400 mt-1">
                            {pkg.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    service.popular
                      ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg hover:shadow-rose-500/25"
                      : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                  }`}
                  onClick={() => {
                    window.location.href = "#companions";
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    {service.buttonText}
                    <span>→</span>
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {extraCards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🤲</span>
                <h3 className="text-2xl font-bold text-white">{card.title}</h3>
              </div>
              <p className="text-slate-300 mb-4">{card.description}</p>
              {card.note && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-blue-300 text-sm">{card.note}</p>
                </div>
              )}
            </motion.div>
          ))}
          {partyCard && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-pink-500/30 hover:border-pink-500/50 transition-colors mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🎉</span>
                <h3 className="text-2xl font-bold text-white">
                  {partyCard.title}
                </h3>
                {partyCard.price && (
                  <span className="ml-4 text-pink-400 font-bold">
                    {partyCard.price}
                  </span>
                )}
              </div>
              {partyCard.note && (
                <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-4 mb-4">
                  <p className="text-pink-300 text-sm">{partyCard.note}</p>
                </div>
              )}
              {partyCard.features && partyCard.features.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {partyCard.features.map((f, idx) => (
                    <li
                      key={idx}
                      className="text-slate-300 text-sm flex items-center gap-2"
                    >
                      <span>•</span> <span>{f.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            {jacuzziSectionTitle}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {jacuzziServices.map((service) => (
              <div key={service.id} className="space-y-4">
                <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span>🛁</span>
                  {service.title.trim()}
                </h4>
                {service.packages.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">⏰</span>
                      <span className="text-white font-medium">
                        {pkg.duration}
                      </span>
                    </div>
                    <span className="text-blue-400 font-bold">{pkg.price}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Special Options deve vir FORA da seção acima */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            {specialOptionsSectionTitle}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialOptions.map((option) => (
              <div
                key={option.name}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-rose-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold text-sm">
                    {option.name}
                  </h4>
                  <span className="text-rose-400 font-bold">
                    {option.price}
                  </span>
                </div>
                {option.note && (
                  <p className="text-sm text-slate-300">{option.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
        {content.professionalBadge && (
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/10 backdrop-blur-sm rounded-full border border-green-500/20">
              <span className="text-green-400">
                {content.professionalBadge.icon}
              </span>
              <span className="text-green-300 font-medium">
                {content.professionalBadge.text}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
