import React, { useState } from "react";
import { Button } from "./ui/button";
import { useLoadingBar } from "./LoadingBar";
import { Loader2 } from "lucide-react";

// Mapea tus variantes/tamaños a los de shadcn
const mapVariant = (v) => {
  switch (v) {
    case "primary":
      return "default";
    case "secondary":
      return "secondary";
    case "ghost":
      return "ghost";
    case "outline":
      return "outline";
    case "destructive":
      return "destructive";
    case "neutral":
      return "neutral";
    default:
      return "default";
  }
};
const mapSize = (s) => {
  switch (s) {
    case "xs":
      return "sm";
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
  isLoading: isLoadingProp,
  loadingText,
  showLoadingBar = false,
  ...props
}) {
  const { start, done } = useLoadingBar();
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = isLoadingProp ?? internalLoading;

  const handleClick = async (e) => {
    if (!onClick || disabled || isLoading) return;
    const ret = onClick(e);
    if (ret && typeof ret.then === "function") {
      try {
        showLoadingBar && start();
        setInternalLoading(true);
        await ret;
      } finally {
        setInternalLoading(false);
        showLoadingBar && done();
      }
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      variant={mapVariant(variant)}
      size={mapSize(size)}
      className={className}
      {...props}
    >
      {isLoading && (
        <Loader2
          className="mr-2 h-4 w-4 animate-spin"
          aria-hidden="true"
        />
      )}
      {isLoading && loadingText ? loadingText : children}
    </Button>
  );
}
