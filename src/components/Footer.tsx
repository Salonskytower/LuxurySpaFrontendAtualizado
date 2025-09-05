"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { contentApi } from "@/lib/api";

import {
  Clock,
  Heart,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCallIcon,
  Send,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";

const socialLinks = [
  {
    icon: Instagram,
    href: "https://www.instagram.com/le_prive_massage/?igsh=MTQ0ZGZoczdxbjg3ZA%3D%3D#",
    name: "Instagram",
  },
  { icon: PhoneCallIcon, href: "tel:+48794583263", name: "Phone" },
  { icon: MessageCircle, href: "https://wa.me/48794583263", name: "WhatsApp" },
];
interface FooterProps {
  language: "pl" | "en";
}
export default function Footer({ language }: FooterProps) {
  const [email, setEmail] = useState("");
  const [quickLinks, setQuickLinks] = useState<
    { name: string; href: string; title?: string }[]
  >([]);
  const [services, setServices] = useState<
    { name: string; href: string; title?: string }[]
  >([]);
  const [contactEmail, setContactEmail] = useState("");
  const [stayConnectedTitle, setStayConnectedTitle] = useState("");

  const [footerDescription, setFooterDescription] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
  };
  const [contactPhone, setContactPhone] = useState("");
  const [contactHours, setContactHours] = useState("");
  const [copyrightText, setCopyrightText] = useState("");
  const [privacyPolicyLink, setPrivacyPolicyLink] = useState("");
  const [termsOfServiceLink, setTermsOfServiceLink] = useState("");
  const [cookiePolicyLink, setCookiePolicyLink] = useState("");
  const [secureInfoButton, setSecureInfoButton] = useState("");
  useEffect(() => {
    async function loadFooterContent() {
      try {
        const data = await contentApi.getFooterContent(language);
        
        if (!data) return;

        // Dados dinâmicos
        setQuickLinks(data.quickLinks || []);
        setServices(data.services || []);
        setFooterDescription(data.footerDescription || "");
        setContactEmail(data.contactEmail || "");
        setStayConnectedTitle(data.StayConnectedTitle || "");
        setContactPhone(data.contactPhone || "");
        setContactHours(data.contactHours || "");
        setCopyrightText(data.copyrightText || "");
        setPrivacyPolicyLink(data.privacyPolicyLink || "");
        setTermsOfServiceLink(data.termsOfServiceLink || "");
        setCookiePolicyLink(data.cookiePolicyLink || "");
        setSecureInfoButton(data.SecureInfoButton || "");
      } catch (err) {
        console.error("Erro ao carregar o conteúdo do rodapé:", err);
      }
    }
    
    loadFooterContent();
  }, [language]);

  return (
    <footer className="bg-gradient-to-b from-black to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-500 rounded-full filter blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/Logo LE PRIVE - white.png"
                alt="Le Privê Logo"
                width={160}
                height={64}
                className="h-16 w-auto"
              />
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {footerDescription ||
                "Experience the ultimate in relaxation and luxury with our exclusive massage services. Your comfort and satisfaction are our top priorities."}
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-4 h-4 text-rose-400" />
                <span className="text-sm">{contactPhone}</span>
              </div>
              {/* <div className="flex items-center gap-3 text-slate-300">
                <Mail className="w-4 h-4 text-rose-400" />
                <span className="text-sm">contact@Le Privê.com</span>
              </div> */}
              <div className="flex items-center gap-3 text-slate-300">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span className="text-sm">Gwiaździsta 62, Wroclaw</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Clock className="w-4 h-4 text-rose-400" />
                <span className="text-sm">{contactHours}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-white font-semibold mb-6">
              {quickLinks[0]?.title || "Quick Links"}
            </h4>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  whileHover={{ x: 5 }}
                  className="block text-slate-300 hover:text-rose-400 text-sm transition-all duration-300"
                >
                  {link.name}
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-white font-semibold mb-6">
              {services[0]?.title || "Our Services"}
            </h4>

            <div className="space-y-3">
              {services.map((service) => (
                <motion.a
                  key={service.name}
                  href={service.href}
                  whileHover={{ x: 5 }}
                  className="block text-slate-300 hover:text-rose-400 text-sm transition-all duration-300"
                >
                  {service.name}
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-white font-semibold mb-6">
              {stayConnectedTitle || "Stay Connected"}
            </h4>

            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={contactEmail || "Your email"}
                  className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm text-white placeholder-slate-400 rounded-l-xl border border-white/20 border-r-0 focus:outline-none focus:border-rose-500"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-r-xl hover:shadow-lg transition-all duration-300"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </form>

            <div className="flex gap-4 mb-6">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-rose-500/20 border border-white/20 hover:border-rose-500/50 transition-all duration-300"
                  >
                    <IconComponent className="w-4 h-4" />
                  </motion.a>
                );
              })}
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 backdrop-blur-sm rounded-full border border-green-500/20">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-xs font-medium">
                {secureInfoButton || "100% Secure & Private"}
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="py-8 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-slate-400 text-sm">
              <span>
                {copyrightText || "© 2025 Le Privê. All rights reserved."}
              </span>

              <Heart className="w-4 h-4 text-rose-400" />
            </div>

            <div className="flex items-center gap-6 text-sm">
              <motion.a href="#" whileHover={{ y: -1 }} className="...">
                {privacyPolicyLink || "Privacy Policy"}
              </motion.a>
              <motion.a href="#" whileHover={{ y: -1 }} className="...">
                {termsOfServiceLink || "Terms of Service"}
              </motion.a>
              <motion.a href="#" whileHover={{ y: -1 }} className="...">
                {cookiePolicyLink || "Cookie Policy"}
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
