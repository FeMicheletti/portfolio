"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  type AnalyticsEventDetails,
  type AnalyticsEventName,
} from "@/lib/analytics/types";
import { ANALYTICS_DISABLED_KEY } from "@/components/public/privacy-controls";

type Locale = "PT_BR" | "EN_US";
type Attribution = {
  referrerHost?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};
type AnalyticsContextValue = {
  track: (
    eventType: AnalyticsEventName,
    details?: AnalyticsEventDetails,
  ) => void;
};

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);
const VISITOR_KEY = "portfolio.analytics.visitor";
const SESSION_KEY = "portfolio.analytics.session";
const SESSION_TIMEOUT = 30 * 60 * 1_000;

function randomId() {
  return (
    globalThis.crypto?.randomUUID?.().replaceAll("-", "") ??
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
  );
}

function safeStorageGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Analytics must never interfere with navigation.
  }
}

function getVisitorId() {
  const existing = safeStorageGet(VISITOR_KEY);
  if (existing && /^[a-zA-Z0-9_-]{16,64}$/.test(existing)) return existing;
  const id = randomId();
  safeStorageSet(VISITOR_KEY, id);
  return id;
}

function currentSession() {
  const now = Date.now();
  const stored = safeStorageGet(SESSION_KEY);
  if (stored) {
    try {
      const session = JSON.parse(stored) as {
        id?: string;
        lastActivity?: number;
      };
      if (
        session.id &&
        session.lastActivity &&
        now - session.lastActivity < SESSION_TIMEOUT
      ) {
        safeStorageSet(
          SESSION_KEY,
          JSON.stringify({ id: session.id, lastActivity: now }),
        );
        return session.id;
      }
    } catch {
      // Create a fresh session below.
    }
  }
  const id = randomId();
  safeStorageSet(SESSION_KEY, JSON.stringify({ id, lastActivity: now }));
  return id;
}

function attribution(): Attribution {
  const parameters = new URLSearchParams(window.location.search);
  let referrerHost: string | undefined;
  if (document.referrer) {
    try {
      const host = new URL(document.referrer).hostname;
      if (host && host !== window.location.hostname) referrerHost = host;
    } catch {
      // Ignore invalid referrers supplied by the browser.
    }
  }
  return {
    referrerHost,
    utmSource: parameters.get("utm_source")?.slice(0, 191) || undefined,
    utmMedium: parameters.get("utm_medium")?.slice(0, 191) || undefined,
    utmCampaign: parameters.get("utm_campaign")?.slice(0, 191) || undefined,
  };
}

export function AnalyticsProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const pageViewSent = useRef(false);
  const source = useMemo(
    () => (typeof window === "undefined" ? {} : attribution()),
    [],
  );

	const track = useCallback(
		(eventType: AnalyticsEventName, details: AnalyticsEventDetails = {}) => {
			if (localStorage.getItem(ANALYTICS_DISABLED_KEY) === "1") return;
      const payload = JSON.stringify({
        eventType,
        visitorId: getVisitorId(),
        sessionId: currentSession(),
        path: `${window.location.pathname}${window.location.search}`.slice(
          0,
          500,
        ),
        locale,
        ...source,
        ...details,
      });

      if (navigator.sendBeacon) {
        const sent = navigator.sendBeacon(
          "/api/analytics",
          new Blob([payload], { type: "application/json" }),
        );
        if (sent) return;
      }
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => undefined);
    },
    [locale, source],
  );

  useEffect(() => {
    if (pageViewSent.current) return;
    pageViewSent.current = true;
    track("PAGE_VIEW");
  }, [track]);

  return (
    <AnalyticsContext.Provider value={{ track }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function usePortfolioAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context)
    throw new Error(
      "usePortfolioAnalytics must be used inside AnalyticsProvider",
    );
  return context;
}

type AnalyticsLinkProps = ComponentProps<"a"> &
  AnalyticsEventDetails & { eventType: AnalyticsEventName };

export function AnalyticsLink({
  eventType,
  projectId,
  targetUrl,
  href,
  onClick,
  ...props
}: AnalyticsLinkProps) {
  const { track } = usePortfolioAnalytics();
  const resolvedTarget =
    targetUrl ?? (typeof href === "string" ? href : undefined);
  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented)
          track(eventType, { projectId, targetUrl: resolvedTarget });
      }}
      {...props}
    />
  );
}

export function AnalyticsProjectView({
  projectId,
  children,
  ...props
}: ComponentProps<"article"> & { projectId: string }) {
  const { track } = usePortfolioAnalytics();
  const seen = useRef(false);
  const article = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = article.current;
    if (!element || seen.current || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries.some(
            (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.6,
          )
        ) {
          seen.current = true;
          track("PROJECT_VIEW", { projectId });
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [projectId, track]);

  return (
    <article ref={article} {...props}>
      {children}
    </article>
  );
}
