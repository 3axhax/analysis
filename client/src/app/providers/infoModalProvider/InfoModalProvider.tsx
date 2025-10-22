import { useState, ReactNode } from "react";
import {
  InfoModalConstructor,
  InfoModalContext,
  InfoModalType,
} from "./InfoModalContext";

// 1. Провайдер
export const InfoModalProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [onAccess, setOnAccess] = useState<(() => void) | null>(null);
  const [title, setTitle] = useState<string>("");
  const [type, setType] = useState<InfoModalType>("standard");

  const openModal = ({
    onAccess: onAccessProps,
    title: titleProps,
    type: typeProps,
  }: InfoModalConstructor) => {
    setOnAccess(() => onAccessProps || null);
    setTitle(titleProps || "");
    setType(typeProps || "standard");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setOnAccess(null);
  };

  return (
    <InfoModalContext.Provider
      value={{ open, openModal, closeModal, onAccess, title, type }}
    >
      {children}
    </InfoModalContext.Provider>
  );
};
