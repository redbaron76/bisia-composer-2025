import React, { forwardRef } from "react";
import { useFieldContext, useFormContext } from "../hooks/demo.form-context";
import { Button } from "@/components/ui/button";
import type { HTMLInputTypeAttribute } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@tanstack/react-form";

export function BisiacariaSubscribeButton({
  label,
  disabled,
  id,
}: {
  label: string;
  disabled?: boolean;
  id?: string;
}) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button 
          type="submit" 
          disabled={isSubmitting || disabled} 
          id={id}
          className="w-full h-10 sm:h-12 bg-black dark:bg-yellow-400 text-yellow-400 dark:text-black hover:bg-stone-800 dark:hover:bg-yellow-500 font-semibold text-sm sm:text-lg transition-colors"
        >
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
}

function ErrorMessages({
  errors,
}: {
  errors: Array<string | { message: string }>;
}) {
  return (
    <>
      {errors.map((error) => (
        <div
          key={typeof error === "string" ? error : error.message}
          className="text-red-500 mt-1 text-xs font-medium"
        >
          {typeof error === "string" ? error : error.message}
        </div>
      ))}
    </>
  );
}

export const BisiacariaTextField = forwardRef<
  HTMLInputElement,
  {
    label: string;
    placeholder?: string;
    inputType?: HTMLInputTypeAttribute;
    onFocus?: () => void;
    className?: string;
    maxLength?: number;
  } & Omit<
    React.ComponentPropsWithoutRef<"input">,
    "value" | "onChange" | "onBlur" | "type" | "onFocus"
  >
>(
  (
    { label, placeholder, inputType = "text", onFocus, className, maxLength, ...rest },
    ref
  ) => {
    const field = useFieldContext<string>();
    const errors = useStore(field.store, (state) => state.meta.errors);

    // Funzione per filtrare input solo numeri e + se inputType è 'tel'
    const handleChange = (value: string) => {
      if (inputType === "tel") {
        // Accetta solo numeri e +
        const filtered = value.replace(/[^0-9+]/g, "");
        field.handleChange(filtered);
      } else {
        field.handleChange(value);
      }
    };

    const inputClasses = "w-full h-10 sm:h-12 border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-black dark:text-white focus:border-black dark:focus:border-yellow-400 focus:ring-0 text-sm sm:text-base";

    return (
      <div className={className || "space-y-2"}>
        <Label 
          htmlFor={label} 
          className="text-black dark:text-yellow-400 font-medium text-sm sm:text-base"
        >
          {label}
        </Label>
        <Input
          ref={ref}
          type={inputType}
          value={field.state.value}
          placeholder={placeholder}
          onBlur={field.handleBlur}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={onFocus}
          maxLength={maxLength}
          className={inputClasses}
          {...rest}
        />
        {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
      </div>
    );
  }
);
BisiacariaTextField.displayName = "BisiacariaTextField";