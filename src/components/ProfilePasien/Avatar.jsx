import React from "react";

export default function Avatar({ src, alt = "" }) {
  return (
    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white p-2 shadow-xl">
      <img
        src={src || "/images/default.png"}
        alt={alt}
        className="w-full h-full rounded-full object-cover"
        onError={(e) => {
          e.target.src = "/images/default.png";
        }}
      />
    </div>
  );
}