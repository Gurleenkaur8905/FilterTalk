import React, { ReactNode } from "react";

interface CardProps {
  className?: string;
  children: ReactNode; // Explicitly type the children prop
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>{children}</div>;
};

interface CardHeaderProps {
  className?: string;
  children: ReactNode; // Explicitly type the children prop
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

interface CardTitleProps {
  className?: string;
  children: ReactNode; // Explicitly type the children prop
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
};

interface CardContentProps {
  className?: string;
  children: ReactNode; // Explicitly type the children prop
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return <div className={`text-gray-700 ${className}`}>{children}</div>;
};

interface CardDescriptionProps {
  className?: string;
  children: ReactNode; // Explicitly type the children prop
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className }) => {
  return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
};
