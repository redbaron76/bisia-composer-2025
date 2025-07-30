import React, { useRef, useEffect, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputOtpProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (otp: string) => void;
  className?: string;
  disabled?: boolean;
}

export const InputOtp = forwardRef<HTMLInputElement, InputOtpProps>(
  ({ label, value, onChange, onComplete, className, disabled = false }, ref) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    
    // Crea un array di 6 cifre dal valore corrente
    const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

    useEffect(() => {
      // Auto-focus sul primo input vuoto
      const firstEmptyIndex = digits.findIndex(digit => digit === '');
      if (firstEmptyIndex !== -1 && inputRefs.current[firstEmptyIndex]) {
        inputRefs.current[firstEmptyIndex]?.focus();
      }
    }, [digits]);

    const handleInputChange = (index: number, inputValue: string) => {
      // Accetta solo numeri
      const numericValue = inputValue.replace(/[^0-9]/g, '');
      
      if (numericValue.length > 1) {
        // Se viene incollato più di un carattere, gestisci come paste
        handlePaste(numericValue);
        return;
      }

      // Aggiorna il valore
      const newDigits = [...digits];
      newDigits[index] = numericValue;
      const newValue = newDigits.join('').replace(/\s/g, '');
      
      onChange(newValue);

      // Se è stata inserita una cifra, passa al prossimo input
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Se l'OTP è completo (6 cifre), chiama onComplete
      if (newValue.length === 6 && onComplete) {
        onComplete(newValue);
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      // Gestione del backspace
      if (e.key === 'Backspace' && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      
      // Gestione delle frecce
      if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      }
      
      if (e.key === 'ArrowRight' && index < 5) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handlePaste = (pastedValue: string) => {
      // Pulisce il valore incollato e prende solo i primi 6 numeri
      const cleanValue = pastedValue.replace(/[^0-9]/g, '').slice(0, 6);
      
      if (cleanValue.length > 0) {
        onChange(cleanValue);
        
        // Se l'OTP è completo, chiama onComplete
        if (cleanValue.length === 6 && onComplete) {
          setTimeout(() => onComplete(cleanValue), 0);
        }
      }
    };

    const handleInputPaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text');
      handlePaste(pastedData);
    };

    return (
      <div className={className || "space-y-2"}>
        <Label className="text-black dark:text-yellow-400 font-medium text-sm sm:text-base">
          {label}
        </Label>
        
        <div className="flex gap-2 justify-center">
          {digits.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
                if (index === 0 && ref && typeof ref === 'function') {
                  ref(el);
                } else if (index === 0 && ref && 'current' in ref) {
                  ref.current = el;
                }
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handleInputPaste}
              disabled={disabled}
              className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-2xl font-bold border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-black dark:text-white focus:border-black dark:focus:border-yellow-400 focus:ring-0 rounded-md"
            />
          ))}
        </div>
      </div>
    );
  }
);

InputOtp.displayName = "InputOtp";