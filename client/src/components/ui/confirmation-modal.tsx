import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDangerous?: boolean;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  isDangerous = true,
}: ConfirmationModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 border border-slate-200 dark:border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon & Title */}
              <div className="text-center space-y-3">
                {isDangerous && (
                  <div className="w-16 h-16 bg-danger-100 dark:bg-danger-900/30 rounded-2xl flex items-center justify-center mx-auto">
                    <AlertTriangle size={32} className="text-danger-600 dark:text-danger-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{message}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`w-full font-semibold py-3.5 px-6 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDangerous
                      ? 'bg-danger-600 dark:bg-danger-500 text-white hover:bg-danger-700 dark:hover:bg-danger-600 active:scale-[0.98]'
                      : 'bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 active:scale-[0.98]'
                  }`}
                >
                  {isLoading ? 'Please wait...' : confirmText}
                </button>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold py-3.5 px-6 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
