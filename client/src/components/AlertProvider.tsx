"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { X } from "lucide-react";

type AlertType = "success" | "error" | "info" | "warning";

type AlertContextValue = {
  showAlert: (message: string, type?: AlertType) => void;
};

type AlertState = {
  open: boolean;
  message: string;
  type: AlertType;
};

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    message: "",
    type: "info",
  });

  const showAlert = (message: string, type: AlertType = "info") => {
    setAlert({ open: true, message, type });
  };

  const closeAlert = () => setAlert((prev) => ({ ...prev, open: false }));

  const contextValue = useMemo(() => ({ showAlert }), []);

  const tone = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  }[alert.type];

  const iconColor = {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
    warning: "text-yellow-500",
  }[alert.type];

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {alert.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            className={`w-full max-w-sm rounded-2xl border shadow-lg ${tone} transition-all`}
          >
            <div className="flex items-start gap-3 p-5">
              <div className={`mt-0.5 ${iconColor}`}>⚡</div>
              <p className="flex-1 text-sm leading-relaxed">{alert.message}</p>
              <button
                onClick={closeAlert}
                className="text-gray-400 hover:text-gray-600 transition"
                aria-label="close alert"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used within AlertProvider");
  return ctx;
};
