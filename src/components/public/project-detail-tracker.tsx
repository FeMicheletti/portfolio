"use client";

import { useEffect } from "react";
import { usePortfolioAnalytics } from "@/components/public/analytics-provider";

export function ProjectDetailTracker({ projectId }: { projectId: string }) {
    const { track } = usePortfolioAnalytics();
    useEffect(() => track("PROJECT_DETAIL_VIEW", { projectId }), [projectId, track]);
    return null;
}
