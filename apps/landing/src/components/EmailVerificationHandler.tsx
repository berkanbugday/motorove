"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "../app/i18n";
import toast from "react-hot-toast";

export default function EmailVerificationHandler() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const hasShownToast = useRef(false);

  useEffect(() => {
    // Prevent showing toast multiple times
    if (hasShownToast.current) {
      return;
    }

    // Parse hash fragment for Supabase parameters
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    
    // Get type from hash fragment (Supabase format)
    const typeFromHash = hashParams.get("type");
    const accessToken = hashParams.get("access_token");
    
    // Get type from query string (custom format)
    const typeFromQuery = searchParams.get("type");
    const tokenFromQuery = searchParams.get("token");

    // Determine which format we're using
    const type = typeFromHash || typeFromQuery;
    const hasValidToken = accessToken || tokenFromQuery;

    // Only show toast if both type and token exist
    if (!type || !hasValidToken) {
      return;
    }

    // Handle email_change verification
    if (type === "email_change") {
      toast.success(t("confirm.emailChange.success"));
      hasShownToast.current = true;
      // Clean URL after showing toast
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    // Handle signup verification
    if (type === "signup") {
      toast.success(t("confirm.signup.success"));
      hasShownToast.current = true;
      // Clean URL after showing toast
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }
  }, [searchParams, t]);

  return null;
}
