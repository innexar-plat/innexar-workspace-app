'use client';

import { motion } from 'framer-motion';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** max width class, e.g. max-w-md, max-w-lg */
  maxWidth?: string;
}

/**
 * Modal reutilizável com tema claro/escuro coerente (usa variáveis CSS do globals.css).
 * Conteúdo deve usar classes modal-label, modal-input, modal-btn-secondary, modal-btn-primary quando for formulário.
 */
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className={`modal-panel ${maxWidth}`}
      >
        <h3 id="modal-title" className="modal-title">{title}</h3>
        {children}
      </motion.div>
    </div>
  );
}
