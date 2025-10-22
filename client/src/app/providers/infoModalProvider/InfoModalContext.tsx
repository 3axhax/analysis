import { createContext, useContext } from "react";

export type InfoModalType = "standard" | "warning" | "danger";

export interface InfoModalConstructor {
  onAccess?: () => void;
  title?: string;
  type?: InfoModalType;
}

interface InfoModalContextType {
  open: boolean;
  openModal: (data: InfoModalConstructor) => void;
  closeModal: () => void;
  onAccess: (() => void) | null;
  title: string;
  type: InfoModalType;
}

export const InfoModalContext = createContext<InfoModalContextType | undefined>(
  undefined,
);

export const useInfoModalData = () => {
  const context = useContext(InfoModalContext);
  if (context === undefined) {
    throw new Error("useInfoModalData must be used within a InfoModalProvider");
  }
  return context;
};
