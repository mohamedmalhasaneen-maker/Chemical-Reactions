import { useCallback, useEffect, useState } from "react";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    __deferredPwaPrompt?: BeforeInstallPromptEvent | null;
  }
}

export type InstallPlatform = "ios" | "android" | "desktop";

function detectPlatform(): InstallPlatform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua) || (ua.includes("mac") && "ontouchend" in document)) {
    return "ios";
  }
  if (/android/.test(ua)) {
    return "android";
  }
  return "desktop";
}

function checkIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => (typeof window !== "undefined" ? window.__deferredPwaPrompt || null : null)
  );
  const [isStandalone, setIsStandalone] = useState<boolean>(checkIsStandalone);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (checkIsStandalone()) return true;
    try {
      return localStorage.getItem("chem_lab_pwa_installed") === "true";
    } catch {
      return false;
    }
  });
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [platform] = useState<InstallPlatform>(detectPlatform);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      window.__deferredPwaPrompt = evt;
      setDeferredPrompt(evt);
    };

    const handleAppInstalled = () => {
      window.__deferredPwaPrompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
      try {
        localStorage.setItem("chem_lab_pwa_installed", "true");
      } catch {
        // ignore
      }
    };

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      if (e.matches) {
        setIsInstalled(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);
    mediaQuery.addEventListener?.("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      mediaQuery.removeEventListener?.("change", handleDisplayModeChange);
    };
  }, []);

  const triggerInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "manual"> => {
    const promptEvent = deferredPrompt || window.__deferredPwaPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === "accepted") {
          window.__deferredPwaPrompt = null;
          setDeferredPrompt(null);
          setIsInstalled(true);
          try {
            localStorage.setItem("chem_lab_pwa_installed", "true");
          } catch {
            // ignore
          }
          return "accepted";
        }
        return "dismissed";
      } catch {
        setShowManualGuide(true);
        return "manual";
      }
    }

    setShowManualGuide(true);
    return "manual";
  }, [deferredPrompt]);

  return {
    canPromptNatively: Boolean(deferredPrompt),
    isInstalled: isInstalled || isStandalone,
    isStandalone,
    platform,
    showManualGuide,
    setShowManualGuide,
    triggerInstall,
  };
}
