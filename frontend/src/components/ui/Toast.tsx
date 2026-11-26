import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiAlertCircle, FiCheck, FiInfo, FiX } from "react-icons/fi";

type ToastVariant = "success" | "error" | "info";
type ToastItem = { id: number; message: string; variant: ToastVariant };

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const icons = {
  success: FiCheck,
  error: FiAlertCircle,
  info: FiInfo,
};

const accents: Record<ToastVariant, string> = {
  success: "bg-matcha",
  error: "bg-burgundy-800",
  info: "bg-sand",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const reduce = useReducedMotion();

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = ++nextId.current;
      setItems((current) => [...current.slice(-2), { id, message, variant }]);
      window.setTimeout(() => dismiss(id), variant === "error" ? 7000 : 5000);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const Icon = icons[item.variant];
            return (
              <motion.div
                key={item.id}
                layout
                role={item.variant === "error" ? "alert" : "status"}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: 12 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto flex w-full max-w-sm items-stretch overflow-hidden border border-ink/15 bg-cream text-ink"
              >
                <span className={`w-1 shrink-0 ${accents[item.variant]}`} aria-hidden />
                <span className="flex items-start gap-3 px-4 py-3.5">
                  <Icon size={16} className="mt-0.5 shrink-0 text-ink/65" aria-hidden />
                  <span className="text-sm leading-relaxed text-ink/85">{item.message}</span>
                </span>
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  aria-label="Dismiss notification"
                  className="ml-auto shrink-0 px-3 text-ink/65 transition hover:text-ink"
                >
                  <FiX size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
