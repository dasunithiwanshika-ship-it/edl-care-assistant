"use client";

import React from "react";
import { useApp } from "../AppContext";
import { EBillModal } from "./EBillModal";

export const EBillModalWrapper: React.FC = () => {
  const { eBillModalOpen, setEBillModalOpen } = useApp();
  return (
    <EBillModal
      isOpen={eBillModalOpen}
      onClose={() => setEBillModalOpen(false)}
    />
  );
};
