"use client";

import { useEffect, useState } from "react";
import AgeVerificationModal from "./AgeVerificationModal";

interface AgeVerificationWrapperProps {
  children: React.ReactNode;
}

export default function AgeVerificationWrapper({
  children,
}: AgeVerificationWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário já confirmou a idade
    const hasVerified = localStorage.getItem("ageVerified");

    if (!hasVerified) {
      setIsModalOpen(true);
    }

    setIsLoading(false);
  }, []);

  const handleConfirm = () => {
    localStorage.setItem("ageVerified", "true");
    setIsModalOpen(false);
  };

  const handleDecline = () => {
    // Redirecionar para uma página externa ou mostrar mensagem
    window.location.href = "https://www.google.com";
  };

  // Não renderizar nada enquanto carrega
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {children}
      <AgeVerificationModal
        isOpen={isModalOpen}
        onConfirm={handleConfirm}
        onDecline={handleDecline}
      />
    </>
  );
}
