import React, { ReactNode, useState } from "react";

interface DialogProps {
  children: ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ children }) => {
  return <div>{children}</div>;
};

interface DialogTriggerProps {
  children: ReactNode;
  onClick?: () => void;
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({
  children,
  onClick,
}) => {
  return (
    <div onClick={onClick} className="focus:outline-none">
      {children}
    </div>
  );
};

interface DialogContentProps {
  children: ReactNode;
}

export const DialogContent: React.FC<DialogContentProps> = ({ children }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        {children}
      </div>
    </div>
  );
};

interface DialogHeaderProps {
  children: ReactNode;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return <div className="mb-4">{children}</div>;
};

interface DialogTitleProps {
  children: ReactNode;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return <h3 className="text-lg font-semibold">{children}</h3>;
};
