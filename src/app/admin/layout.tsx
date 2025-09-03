"use client";
import { PanelTextsProvider } from "@/context/PanelTextsContext";
import AdminLayout from "@/components/admin/AdminLayout";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PanelTextsProvider>
      <AdminLayout>
        {children}
      </AdminLayout>
    </PanelTextsProvider>
  );
}
