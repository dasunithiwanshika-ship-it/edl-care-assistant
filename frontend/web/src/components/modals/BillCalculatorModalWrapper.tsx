"use client";

import React from "react";
import { useApp } from "../AppContext";
import { BillCalculatorModal } from "./BillCalculatorModal";

export const BillCalculatorModalWrapper: React.FC = () => {
  const { billCalcModalOpen, setBillCalcModalOpen } = useApp();
  return (
    <BillCalculatorModal
      isOpen={billCalcModalOpen}
      onClose={() => setBillCalcModalOpen(false)}
    />
  );
};
