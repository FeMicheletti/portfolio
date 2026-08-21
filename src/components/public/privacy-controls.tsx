"use client";

import { useSyncExternalStore } from "react";

export const ANALYTICS_DISABLED_KEY = "portfolio.analytics.disabled";

export function PrivacyControls() {
    const enabled = useSyncExternalStore(
        (listener) => {
            window.addEventListener("storage", listener);
            window.addEventListener("portfolio-privacy-change", listener);
            return () => {
                window.removeEventListener("storage", listener);
                window.removeEventListener("portfolio-privacy-change", listener);
            };
        },
        () => localStorage.getItem(ANALYTICS_DISABLED_KEY) !== "1",
        () => true,
    );
    function update(next: boolean) {
        if (next) localStorage.removeItem(ANALYTICS_DISABLED_KEY);
        else {
            localStorage.setItem(ANALYTICS_DISABLED_KEY, "1");
            localStorage.removeItem("portfolio.analytics.visitor");
            localStorage.removeItem("portfolio.analytics.session");
        }
        window.dispatchEvent(new Event("portfolio-privacy-change"));
    }
    return (
        <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => update(!enabled)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200 hover:bg-white/10"
        >
            Analytics anônimo: <strong>{enabled ? "ativado" : "desativado"}</strong>
        </button>
    );
}
