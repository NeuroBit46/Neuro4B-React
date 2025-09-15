import React from "react";
import { Button } from "./ui/button";

// Mapea tus variantes/tamaños a los de shadcn
const mapVariant = (v) => {
  switch (v) {
    case "primary":
      return "default";
    case "secondary":
      return "secondary";
    case "danger":
    case "destructive":
      return "destructive";
    case "outline":
      return "outline";
    case "ghost":
      return "ghost";
    case "link":
      return "link";
    default:
      return "default";
  }
};

const mapSize = (s) => {
  switch (s) {
    case "sm":
      return "sm";
    case "md":
      return "default";
    case "lg":
      return "lg";
    case "icon":
      return "icon";
    default:
      return "default";
  }
};

export default function ButtonBase({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "sm",
  className = "",
  ...props
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={mapVariant(variant)}
      size={mapSize(size)}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}
