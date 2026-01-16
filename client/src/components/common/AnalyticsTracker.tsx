"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visitorId, setVisitorId] = useState<string | null>(null);

  // 1. Inicializar ou recuperar VisitorID
  useEffect(() => {
    let storedId = localStorage.getItem("inscrevase_visitor_id");
    if (!storedId) {
      storedId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("inscrevase_visitor_id", storedId);
    }
    setVisitorId(storedId);
  }, []);

  // 2. Monitorar navegação e enviar dados
  useEffect(() => {
    if (!visitorId) return;

    const recordVisit = async () => {
      try {
        const fullUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        
        // Coletar info básica do navegador
        const browserInfo = navigator.userAgent;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(browserInfo);
        
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/analytics/visit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId,
            page: fullUrl || '/',
            referrer: document.referrer,
            deviceType: isMobile ? 'mobile' : 'desktop',
            browser: browserInfo
          })
        });
      } catch (err) {
        // Silencioso para não atrapalhar o user
        console.error("Analytics Error (Silent):", err);
      }
    };

    recordVisit();

  }, [pathname, searchParams, visitorId]);

  return null; // Componente invisível
}
