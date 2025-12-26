import React from "react";

export default function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) {
  const variants = {
    danger:
      "bg-white text-red-500 hover:bg-red-50 border-2 border-white disabled:opacity-50 disabled:cursor-not-allowed",
    success:
      "bg-teal-500 text-white hover:bg-teal-600 border-2 border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed",
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50", // Default style jika diperlukan
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-8 py-2 rounded-full font-medium transition-all ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}