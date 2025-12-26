import React from "react";

export default function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="text-white/90 text-sm">{label}</span>
      <span className="text-white/90 text-sm">:</span>
      <span className="text-white font-medium text-sm flex-1">{value}</span>
    </div>
  );
}