import React, { useState, ReactNode } from "react";

interface PopoverProps {
  children: ReactNode;
}

export const Popover: React.FC<PopoverProps> = ({ children }) => {
  return <div className="relative">{children}</div>;
};

interface PopoverTriggerProps {
  children: ReactNode;
  onClick?: () => void;
}

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children, onClick }) => {
  return (
    <div
      className="focus:outline-none"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface PopoverContentProps {
  children: ReactNode;
  className?: string;
}

export const PopoverContent: React.FC<PopoverContentProps> = ({ children, className }) => {
  return (
    <div
      className={`absolute bg-white shadow-md rounded-lg p-4 w-72 z-10 ${className}`}
    >
      {children}
    </div>
  );
};
