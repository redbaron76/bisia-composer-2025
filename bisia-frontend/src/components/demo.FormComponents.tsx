import * as ShadcnSelect from "@/components/ui/select";

import React, { forwardRef } from "react";
import { useFieldContext, useFormContext } from "../hooks/demo.form-context";

import { Button } from "@/components/ui/button";
import type { HTMLInputTypeAttribute } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider as ShadcnSlider } from "@/components/ui/slider";
import { Switch as ShadcnSwitch } from "@/components/ui/switch";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { useStore } from "@tanstack/react-form";

export function SubscribeButton({
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
        <Button type="submit" disabled={isSubmitting || disabled} id={id}>
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
          className="text-red-500 mt-1 font-bold"
        >
          {typeof error === "string" ? error : error.message}
        </div>
      ))}
    </>
  );
}

export const TextField = forwardRef<
  HTMLInputElement,
  {
    label: string;
    placeholder?: string;
    inputType?: HTMLInputTypeAttribute;
    onFocus?: () => void;
    className?: string;
  } & Omit<
    React.ComponentPropsWithoutRef<"input">,
    "value" | "onChange" | "onBlur" | "type" | "onFocus"
  >
>(
  (
    { label, placeholder, inputType = "text", onFocus, className, ...rest },
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

    return (
      <div className={className}>
        <Label htmlFor={label} className="mb-2 text-xl font-bold">
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
          {...rest}
        />
        {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
      </div>
    );
  }
);
TextField.displayName = "TextField";

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  {
    label: string;
    rows?: number;
    className?: string;
  } & Omit<
    React.ComponentPropsWithoutRef<"textarea">,
    "value" | "onChange" | "onBlur"
  >
>(({ label, rows = 3, className, ...rest }, ref) => {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <div className={className}>
      <Label htmlFor={label} className="mb-2 text-xl font-bold">
        {label}
      </Label>
      <ShadcnTextarea
        id={label}
        ref={ref}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        rows={rows}
        {...rest}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
});
TextArea.displayName = "TextArea";

export const Select = forwardRef<
  HTMLButtonElement,
  {
    label: string;
    values: Array<{ label: string; value: string }>;
    placeholder?: string;
    className?: string;
  } & Omit<
    React.ComponentPropsWithoutRef<typeof ShadcnSelect.SelectTrigger>,
    "value" | "onValueChange" | "onBlur" | "name"
  >
>(({ label, values, placeholder, className, ...rest }, ref) => {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <div className={className}>
      <ShadcnSelect.Select
        name={field.name}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
      >
        <ShadcnSelect.SelectTrigger ref={ref} className="w-full" {...rest}>
          <ShadcnSelect.SelectValue placeholder={placeholder} />
        </ShadcnSelect.SelectTrigger>
        <ShadcnSelect.SelectContent>
          <ShadcnSelect.SelectGroup>
            <ShadcnSelect.SelectLabel>{label}</ShadcnSelect.SelectLabel>
            {values.map((value) => (
              <ShadcnSelect.SelectItem key={value.value} value={value.value}>
                {value.label}
              </ShadcnSelect.SelectItem>
            ))}
          </ShadcnSelect.SelectGroup>
        </ShadcnSelect.SelectContent>
      </ShadcnSelect.Select>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
});
Select.displayName = "Select";

export const Slider = forwardRef<
  HTMLSpanElement,
  {
    label: string;
    className?: string;
  } & Omit<
    React.ComponentPropsWithoutRef<typeof ShadcnSlider>,
    "value" | "onValueChange" | "onBlur"
  >
>(({ label, className, ...rest }, ref) => {
  const field = useFieldContext<number>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <div className={className}>
      <Label htmlFor={label} className="mb-2 text-xl font-bold">
        {label}
      </Label>
      <ShadcnSlider
        id={label}
        ref={ref}
        onBlur={field.handleBlur}
        value={[field.state.value]}
        onValueChange={(value) => field.handleChange(value[0])}
        {...rest}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
});
Slider.displayName = "Slider";

export const Switch = forwardRef<
  HTMLButtonElement,
  {
    label: string;
    className?: string;
  } & Omit<
    React.ComponentPropsWithoutRef<typeof ShadcnSwitch>,
    "checked" | "onCheckedChange" | "onBlur"
  >
>(({ label, className, ...rest }, ref) => {
  const field = useFieldContext<boolean>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <ShadcnSwitch
          id={label}
          ref={ref}
          onBlur={field.handleBlur}
          checked={field.state.value}
          onCheckedChange={(checked) => field.handleChange(checked)}
          {...rest}
        />
        <Label htmlFor={label}>{label}</Label>
      </div>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
});
Switch.displayName = "Switch";
