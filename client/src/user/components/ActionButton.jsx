import React from "react";

export const ActionButton = ({
  onClick,
  variant = "primary",
  children,
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  };
  return (
    <button className={`${baseStyles} ${variants[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
};
