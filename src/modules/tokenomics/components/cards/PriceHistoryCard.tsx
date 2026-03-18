"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import InfoCard from "@/common/components/cards/InfoCard";
import { secondaryThemeColors } from "@/common/styles/themeColors";
import { useGetPriceHistoryQuery } from "@/store/api/tokenomicsApi";

// Import chart component with SSR disabled
const PriceHistoryChart = dynamic(
  () => import("@/modules/tokenomics/components/charts/PriceHistoryChart"),
  { ssr: false }
);

const DAY_OPTIONS = [7, 30, 90];
const DEFAULT_DAYS = 30;

export interface PriceHistoryCardProps {
  dayOptions?: number[];
  onLoadingChange?: (isLoading: boolean) => void;
}

export function PriceHistoryCard({
  dayOptions = DAY_OPTIONS,
  onLoadingChange,
}: PriceHistoryCardProps) {
  const [currentSelectedDay, setCurrentSelectedDay] = useState<number>(DEFAULT_DAYS);

  const handleDaysChange = (days: number) => {
    setCurrentSelectedDay(days);
  };

  const { data: priceHistoryData, isLoading } = useGetPriceHistoryQuery(currentSelectedDay);

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex-1 min-h-[450px]">
        <PriceHistoryChart
          onDaysChange={handleDaysChange}
          currentSelectedDay={currentSelectedDay}
          dayOptions={dayOptions}
          themeColors={secondaryThemeColors}
        />
      </div>

      {/* Metrics grid at bottom */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Current Price */}
        <InfoCard
          title="Current Price"
          isLoading={isLoading}
          value={priceHistoryData?.priceHistory?.at(-1)?.price}
          valuePrefix="$"
          themeColors={secondaryThemeColors}
        />
        {/* All-Time High */}
        <InfoCard
          title="All-Time High"
          isLoading={isLoading}
          value={priceHistoryData?.allTimeHigh}
          valuePrefix="$"
          themeColors={secondaryThemeColors}
        />
        {/* All-Time Low */}
        <InfoCard
          title="All-Time Low"
          isLoading={isLoading}
          value={priceHistoryData?.allTimeLow?.toFixed(4)}
          valuePrefix="$"
          themeColors={secondaryThemeColors}
        />
      </div>
    </div>
  );
}
