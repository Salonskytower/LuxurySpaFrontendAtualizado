import React, { createContext, useContext, useEffect, useState } from "react";

// Use a interface separada em src/types/adminPanelTexts.ts para facilitar manutenção
export interface AdminPanelTexts {
    no_bookings_label: string;
    dashboard_title: string;
    dashboard_subtitle: string;
    total_bookings_label: string;
    active_companions_label: string;
    monthly_revenue_label: string;
    pending_bookings_label: string;
    recent_bookings_label: string;
    client_label: string;
    companion_label: string;
    date_time_label: string;
    amount_label: string;
    status_label: string;
    actions_label: string;
    search_bookings_placeholder: string;
    confirmed_label: string;
    pending_label: string;
    cancelled_label?: string; // se existir no Strapi
    sidebar_logout: string;
    sidebar_admin_user: string;
    sidebar_dashboard: string;
    back_to_site: string;
    sidebar_admin_role?: string;
    status_confirmed_notification?: string;
    status_cancelled_notification?: string;
    status_pending_notification?: string;
    loading_label?: string;
    // ...adicione mais campos conforme seu Strapi crescer
}

type Language = "pl" | "en";
interface PanelTextsContextType {
    language: Language;
    setLanguage: React.Dispatch<React.SetStateAction<Language>>;
    panelTexts: AdminPanelTexts | null;
    loading: boolean;
}

const PanelTextsContext = createContext<PanelTextsContextType | undefined>(undefined);

export function PanelTextsProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");
    const [panelTexts, setPanelTexts] = useState<AdminPanelTexts | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "https://api.leprive.fun";
        fetch(`${STRAPI_URL}/api/admin-panel-text?locale=${language}`)
            .then((res) => res.json())
            .then((data) => {
                setPanelTexts(data.data as AdminPanelTexts);
                setLoading(false);
            });
    }, [language]);

    return (
        <PanelTextsContext.Provider value={{ language, setLanguage, panelTexts, loading }}>
            {children}
        </PanelTextsContext.Provider>
    );
}

export function usePanelTexts() {
    const context = useContext(PanelTextsContext);
    if (!context) throw new Error("usePanelTexts must be used within a PanelTextsProvider");
    return context;
}
