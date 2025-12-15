"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useTranslation } from "../../i18n";
import toast from "react-hot-toast";

interface ResetPasswordPageProps {
  params: {
    locale: string;
  };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [resetStatus, setResetStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Zod validation schema
  const resetPasswordSchema = z
    .object({
      newPassword: z
        .string()
        .min(6, t("resetPassword.passwordTooShort"))
        .nonempty(t("resetPassword.passwordPlaceholder")),
      confirmPassword: z
        .string()
        .nonempty(t("resetPassword.confirmPlaceholder")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("resetPassword.passwordMismatch"),
      path: ["confirmPassword"],
    });

  type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    // Supabase PKCE flow sends token_hash and type=recovery in query params
    // Also support hash fragments for backward compatibility
    const hash = window.location.hash;
    let token = "";

    // First, check for token_hash in query params (Supabase PKCE flow)
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (tokenHash && type === "recovery") {
      token = tokenHash;
    }

    // If no token_hash, check hash fragments (legacy flow)
    if (!token && hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      token = hashParams.get("access_token") || "";
    }

    // If still no token, check for direct token param
    if (!token) {
      token = searchParams.get("token") || "";
    }

    if (!token) {
      setResetStatus("error");
      setErrorMessage(t("resetPassword.invalidToken"));
      toast.error(t("resetPassword.invalidToken"));
    } else {
      setAccessToken(token);
    }
  }, [searchParams, t]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!accessToken) {
      setErrorMessage(t("resetPassword.invalidToken"));
      toast.error(t("resetPassword.invalidToken"));
      return;
    }

    setErrorMessage("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/api/auth/update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: accessToken,
          password: data.newPassword,
        }),
      });

      if (response.ok) {
        setResetStatus("success");
        toast.success(t("resetPassword.success"));
      } else {
        try {
          const errorData = await response.json();
          const errorMsg = errorData.message || t("resetPassword.errorMessage");
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
        } catch (parseError) {
          setErrorMessage(t("resetPassword.errorMessage"));
          toast.error(t("resetPassword.errorMessage"));
        }
        setResetStatus("error");
      }
    } catch (error) {
      setErrorMessage(t("resetPassword.errorMessage"));
      toast.error(t("resetPassword.errorMessage"));
      setResetStatus("error");
    }
  };

  const handleGoHome = () => {
    router.push(`/${params.locale}`);
  };

  return (
    <main className="min-h-screen bg-neutral-white dark:bg-background-primary flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-background-secondary">
        {resetStatus === "success" ? (
          <>
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <svg
                  className="h-8 w-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="mb-4 text-center text-2xl font-bold text-neutral-900 dark:text-neutral-white">
              {t("resetPassword.success")}
            </h1>
            <p className="mb-8 text-center text-neutral-600 dark:text-neutral-400">
              {t("resetPassword.successMessage")}
            </p>
            <motion.button
              onClick={handleGoHome}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-4 bg-primary-main text-neutral-white font-semibold rounded-4xl text-lg transition-all duration-200 hover:bg-primary-light inline-flex items-center justify-center gap-2"
            >
              <span>{t("resetPassword.goHome")}</span>
            </motion.button>
          </>
        ) : resetStatus === "error" && !accessToken ? (
          <>
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <svg
                  className="h-8 w-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h1 className="mb-4 text-center text-2xl font-bold text-neutral-900 dark:text-neutral-white">
              {t("resetPassword.error")}
            </h1>
            <p className="mb-8 text-center text-neutral-600 dark:text-neutral-400">
              {errorMessage || t("resetPassword.invalidToken")}
            </p>
            <motion.button
              onClick={handleGoHome}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-4 bg-primary-main text-neutral-white font-semibold rounded-4xl text-lg transition-all duration-200 hover:bg-primary-light inline-flex items-center justify-center gap-2"
            >
              <span>{t("resetPassword.goHome")}</span>
            </motion.button>
          </>
        ) : (
          <>
            <h1 className="mb-2 text-center text-2xl font-bold text-neutral-900 dark:text-neutral-white">
              {t("resetPassword.title")}
            </h1>
            <p className="mb-8 text-center text-neutral-600 dark:text-neutral-400">
              {t("resetPassword.description")}
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-white"
                >
                  {t("resetPassword.newPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    {...register("newPassword")}
                    placeholder={t("resetPassword.passwordPlaceholder")}
                    className={`w-full rounded-lg border ${
                      errors.newPassword
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                    } bg-white px-4 py-3 pr-12 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 dark:border-neutral-700 dark:bg-background-tertiary dark:text-neutral-white dark:placeholder-neutral-500`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                    tabIndex={-1}
                  >
                    {!showNewPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-neutral-900 dark:text-neutral-white"
                >
                  {t("resetPassword.confirmPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    {...register("confirmPassword")}
                    placeholder={t("resetPassword.confirmPlaceholder")}
                    className={`w-full rounded-lg border ${
                      errors.confirmPassword
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                    } bg-white px-4 py-3 pr-12 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 dark:border-neutral-700 dark:bg-background-tertiary dark:text-neutral-white dark:placeholder-neutral-500`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                    tabIndex={-1}
                  >
                    {!showConfirmPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              {errorMessage && resetStatus === "error" && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {errorMessage}
                </div>
              )}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className="w-full px-8 py-4 bg-primary-main text-neutral-white font-semibold rounded-4xl text-lg transition-all duration-200 hover:bg-primary-light inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>
                  {isSubmitting
                    ? t("resetPassword.submitting")
                    : t("resetPassword.submitButton")}
                </span>
              </motion.button>
            </form>
            <motion.button
              onClick={handleGoHome}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 w-full text-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-main dark:hover:text-primary-light transition-colors duration-200"
            >
              {t("resetPassword.goHome")}
            </motion.button>
          </>
        )}
      </div>
    </main>
  );
}
