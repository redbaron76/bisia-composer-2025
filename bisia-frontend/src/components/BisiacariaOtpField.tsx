import { forwardRef } from "react";
import { useFieldContext } from "../hooks/demo.form-context";
import { useStore } from "@tanstack/react-form";
import { InputOtp } from "./InputOtp";

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

export const BisiacariaOtpField = forwardRef<
  HTMLInputElement,
  {
    label: string;
    onOtpComplete?: () => void;
    className?: string;
    disabled?: boolean;
  }
>(({ label, onOtpComplete, className, disabled = false }, ref) => {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <div className={className || "space-y-2"}>
      <InputOtp
        ref={ref}
        label={label}
        value={field.state.value}
        onChange={field.handleChange}
        onComplete={(otp) => {
          field.handleChange(otp);
          // Chiama la callback se fornita
          if (onOtpComplete) {
            setTimeout(() => onOtpComplete(), 100);
          }
        }}
        disabled={disabled}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
});

BisiacariaOtpField.displayName = "BisiacariaOtpField";