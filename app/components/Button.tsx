import { Button } from "@/components/ui/button";
import React from "react";

interface CustomButtonProps {
  type: "button" | "submit" | "reset";
  classes: string;
  state?: boolean;
  name: string;
  onClick?: () => void;
}

const CustomButton = ({
  type,
  classes,
  state,
  name,
  onClick,
}: CustomButtonProps) => {
  if (onClick)
    return (
      <Button
        type={type}
        className={`hover:bg-primaryBG ${classes}`}
        disabled={state}
        onClick={onClick}
      >
        {state ? "Loading..." : name}
      </Button>
    );

  return (
    <Button
      type={type}
      className={`hover:bg-primaryBG ${classes}`}
      disabled={state}
    >
      {state ? "Loading..." : name}
    </Button>
  );
};

export default CustomButton;
