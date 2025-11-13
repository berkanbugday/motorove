"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 10000,
        style: {
          background: "#363636",
          color: "#fff",
        },
        success: {
          duration: 10000,
          iconTheme: {
            primary: "#10b981",
            secondary: "#fff",
          },
        },
        error: {
          duration: 10000,
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
