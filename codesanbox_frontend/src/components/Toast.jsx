import React from "react";
import { Toaster } from "react-hot-toast";

export const Toast = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3200,
        style: {
          background: "#000000",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#ffffff",
          fontFamily: "var(--font-mono)",
          fontSize: "14px",
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#000000",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#000000",
          },
        },
      }}
    />
  );
};
