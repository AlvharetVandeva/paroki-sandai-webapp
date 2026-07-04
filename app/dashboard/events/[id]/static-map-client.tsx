"use client";

import dynamic from "next/dynamic";

const StaticMap = dynamic(() => import("@/components/static-map"), { ssr: false });

export default function StaticMapClient({ latitude, longitude }: { latitude: number; longitude: number }) {
  return <StaticMap latitude={latitude} longitude={longitude} />;
}
