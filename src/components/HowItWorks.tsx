"use client";

import { useState } from "react";
import { useEffect } from "react";
import { contentApi } from "@/lib/api";

interface WhyChooseUsSectionProps {
  language: "pl" | "en";
}

export default function HowItWorksSection({
  language,
}: WhyChooseUsSectionProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [features, setFeatures] = useState<
    {
      id: number;
      icon: string;
      title: string;
      description: string;
      footer: string;
      color: string;
      borderColor: string;
    }[]
  >([]);
  const [bottomCards, setBottomCards] = useState<
    { id: number; icon: string; title: string; description: string }[]
  >([]);
  const [bottomSectionTitle, setBottomSectionTitle] = useState("");
  const [bottomSectionAccent, setBottomSectionAccent] = useState("");
  const [bottomSubtitle, setBottomSubtitle] = useState("");
  const [bottomButtonText, setBottomButtonText] = useState("");

  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionAccent, setSectionAccent] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [button, setButton] = useState({ text: "", icon: "" });

  useEffect(() => {
    async function loadWhyChooseContent() {
      try {
        const data = await contentApi.getWhyChooseContent(language);
        if (!data) return;

        setSectionTitle(data.sectionTitle || "");
        setSectionAccent(data.sectionAccent || "");
        setSubtitle(data.subtitle || "");

        if (Array.isArray(data.cards)) {
          // Atribuir uma cor diferente para cada card
          const colors = [
            {
              color: "from-blue-500 to-cyan-500",
              borderColor: "border-blue-400/50",
            },
            {
              color: "from-rose-500 to-pink-600",
              borderColor: "border-rose-400/50",
            },
            {
              color: "from-purple-500 to-indigo-600",
              borderColor: "border-purple-400/50",
            },
          ];

          interface CardData {
            id: number;
            icon: string;
            title: string;
            description: string;
            footer: string;
          }

          interface ColorData {
            color: string;
            borderColor: string;
          }

          const mapped: (CardData & ColorData)[] = (
            data.cards as CardData[]
          ).map((card: CardData, index: number) => ({
            id: card.id,
            icon: card.icon,
            title: card.title,
            description: card.description,
            footer: card.footer,
            ...colors[index % colors.length],
          }));

          setFeatures(mapped);
        }

        if (data.bottomButton) {
          setButton({
            text: data.bottomButton.text || "",
            icon: data.bottomButton.icon || "",
          });
        }
      } catch (err) {
        console.error("Erro ao carregar seção:", err);
      }
    }
    
    loadWhyChooseContent();
  }, [language]);

  useEffect(() => {
    async function loadWhyChooseSection() {
      try {
        const data = await contentApi.getWhyChooseSection(language);
        if (!data) return;

        setBottomSectionTitle(data.sectionTitle || "");
        setBottomSectionAccent(data.sectionAccent || "");
        setBottomSubtitle(data.subtitle || "");
        setBottomButtonText(data.bottomDescription || "");

        if (Array.isArray(data.bottomCards)) {
          setBottomCards(data.bottomCards);
        }
      } catch (err) {
        console.error("Erro ao carregar seção inferior:", err);
      }
    }
    
    loadWhyChooseSection();
  }, [language]);

  return (
    <section className="py-20 bg-gradient-to-b from-black via-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-40 left-20 w-96 h-96 bg-rose-500 rounded-full filter blur-3xl" />
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500 rounded-full filter blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <span className="text-2xl">💎</span>
            <span className="text-white/90 font-medium">{button.text}</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {sectionTitle}{" "}
            <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
              {sectionAccent}
            </span>
          </h2>
          <p className="text-2xl text-rose-300 max-w-2xl mx-auto font-medium">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => (
            <div
              key={feature.id}
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative"
            >
              <div
                className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border ${
                  feature.borderColor
                } hover:border-rose-500/50 transition-all duration-500 h-full flex flex-col transform ${
                  hoveredCard === feature.id ? "scale-105 -translate-y-2" : ""
                }`}
              >
                <div className="text-center mb-8">
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${
                      feature.color
                    } rounded-full mb-6 transform ${
                      hoveredCard === feature.id ? "rotate-12 scale-110" : ""
                    } transition-transform duration-300 shadow-2xl`}
                  >
                    <span className="text-3xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-6">
                    {feature.title}
                  </h3>
                </div>

                <div className="flex-grow">
                  <p className="text-slate-300 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-center">
                    <span className="text-rose-400 font-semibold">
                      {feature.footer}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10 text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-6">
              {bottomSectionTitle}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                {bottomSectionAccent}
              </span>
            </h3>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              {bottomSubtitle}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {bottomCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white/5 rounded-xl p-6 border border-white/10 text-center hover:scale-105 transition-transform duration-300"
                >
                  <span className="text-2xl mb-3 block">{card.icon}</span>
                  <h4 className="text-white font-semibold mb-2">
                    {card.title}
                  </h4>
                  {card.description && (
                    <p className="text-slate-400 text-sm">{card.description}</p>
                  )}
                </div>
              ))}
            </div>

            {bottomButtonText && (
              <button
                onClick={() => {
                  window.location.href = "#services";
                }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full font-semibold text-lg shadow-2xl hover:shadow-rose-500/25 transition-all duration-300 hover:scale-105"
              >
                {bottomButtonText}
                <span className="text-xl">→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
