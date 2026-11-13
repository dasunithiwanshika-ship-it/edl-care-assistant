"use client";

import React from "react";
import { useApp } from "../AppContext";
import { SolarCapacityModal } from "./SolarCapacityModal";

export const SolarCapacityModalWrapper: React.FC = () => {
  const { solarModalOpen, setSolarModalOpen } = useApp();
  return (
    <SolarCapacityModal
      isOpen={solarModalOpen}
      onClose={() => setSolarModalOpen(false)}
    />
  );
};
