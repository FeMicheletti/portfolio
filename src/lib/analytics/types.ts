export const analyticsEventTypes = [
  "PAGE_VIEW",
  "RESUME_DOWNLOAD",
  "PROJECT_VIEW",
  "PROJECT_DEMO_CLICK",
  "PROJECT_GITHUB_CLICK",
  "GITHUB_CLICK",
  "LINKEDIN_CLICK",
  "EMAIL_CLICK",
  "LANGUAGE_CHANGE",
  "WHATSAPP_CLICK",
] as const;

export type AnalyticsEventName = (typeof analyticsEventTypes)[number];

export type AnalyticsEventDetails = {
  projectId?: string;
  targetUrl?: string;
};
