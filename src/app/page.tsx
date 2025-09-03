"use client";
import { useState } from "react";
import CompanionsGallery from "@/components/companion/CompanionsGallery";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import WhyChooseUsSection from "@/components/HowItWorks";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageCarouselSection from "@/components/ImageCarousel";
import AuthModal from "@/components/AuthModal";

export default function Home() {
  const [language, setLanguage] = useState<"pl" | "en">("pl");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userUpdateTrigger, setUserUpdateTrigger] = useState(0);

  const handleUserUpdate = () => {
    setUserUpdateTrigger((prev) => prev + 1);
  };

  return (
    <>
      <main>
        <Header
          key={userUpdateTrigger}
          language={language}
          setLanguage={setLanguage}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
        <HeroSection language={language} />
        <div id="companions">
          <CompanionsGallery language={language} />
        </div>
        <div id="services">
          <ServicesSection language={language} />
        </div>
        <div id="image-carousel">
          <ImageCarouselSection language={language} />
        </div>
        <div id="how-it-works">
          <WhyChooseUsSection language={language} />
        </div>
        <div id="contact">
          <Footer language={language} />
        </div>
      </main>

      {/* ✅ Modal fora do main */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onUserUpdate={handleUserUpdate}
        language={language}
      />
    </>
  );
}
