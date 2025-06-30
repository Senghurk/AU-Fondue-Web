import React from "react";

export const Button = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`font-medium py-2 px-4 rounded transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
