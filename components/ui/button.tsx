import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  // Combine the base class names with the optional className prop
  const combinedClassName = [
    "px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2",
    className // Add the user-provided className if it exists
  ]
    .filter(Boolean) // Remove falsy values (e.g., undefined, null, etc.)
    .join(" "); // Join class names with a space

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
};
