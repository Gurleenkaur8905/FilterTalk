import React, { ReactNode, useState } from "react";

interface TooltipProviderProps {
  children: ReactNode;
}

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => {
  return <div>{children}</div>;
};

interface TooltipProps {
  children: ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  return <div className="relative">{children}</div>;
};

interface TooltipTriggerProps {
  children: ReactNode;
}

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ children }) => {
  return <div className="inline-block">{children}</div>;
};

interface TooltipContentProps {
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

export const TooltipContent: React.FC<TooltipContentProps> = ({
  children,
  side = "top",
}) => {
  const sideClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
  };

  return (
    <div
      className={`absolute ${sideClasses[side]} bg-gray-900 text-white text-xs rounded-md px-2 py-1 shadow-lg`}
    >
      {children}
    </div>
  );
};
