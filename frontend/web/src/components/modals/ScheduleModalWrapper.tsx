"use client";

import React from "react";
import { useApp } from "../AppContext";
import { ScheduleModal } from "./ScheduleModal";

export const ScheduleModalWrapper: React.FC = () => {
  const { scheduleModalOpen, setScheduleModalOpen } = useApp();
  return (
    <ScheduleModal
      isOpen={scheduleModalOpen}
      onClose={() => setScheduleModalOpen(false)}
    />
  );
};
