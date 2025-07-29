import React from 'react';
import { useNicknameValidation, useNicknameAvailability } from '@/hooks/useNicknameValidation';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface NicknameFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function NicknameField({ 
  value, 
  onChange, 
  label = "Nickname",
  placeholder = "Inserisci il tuo nickname",
  className = ""
}: NicknameFieldProps) {
  const validation = useNicknameValidation(value);
  const availability = useNicknameAvailability(value);

  const getStatusIcon = () => {
    if (validation.isLoading || availability.isChecking) {
      return <Loader2 className="w-4 h-4 animate-spin text-stone-500" />;
    }
    
    if (!value || value.trim().length === 0) {
      return null;
    }

    if (!validation.isValid) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }

    if (availability.isAvailable === false) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }

    if (availability.isAvailable === true) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }

    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusMessage = () => {
    if (!value || value.trim().length === 0) {
      return null;
    }

    if (validation.isLoading) {
      return <span className="text-stone-500">Validazione in corso...</span>;
    }

    if (!validation.isValid) {
      return (
        <div className="space-y-2">
          <span className="text-red-600 dark:text-red-400">{validation.error}</span>
          {validation.suggestions && validation.suggestions.length > 0 && (
            <div>
              <p className="text-sm text-stone-600 dark:text-stone-400">Suggerimenti:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {validation.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onChange(suggestion)}
                    className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (availability.isChecking) {
      return <span className="text-stone-500">Verifica disponibilità...</span>;
    }

    if (availability.error) {
      return <span className="text-red-600 dark:text-red-400">{availability.error}</span>;
    }

    if (availability.isAvailable === true) {
      return (
        <div className="space-y-1">
          <span className="text-green-600 dark:text-green-400">
            ✓ Nickname disponibile!
          </span>
          <div className="text-xs text-stone-600 dark:text-stone-400">
            Il tuo profilo sarà disponibile su: <code className="bg-stone-100 dark:bg-stone-800 px-1 rounded">bisiacaria.com/{validation.slug}</code>
          </div>
        </div>
      );
    }

    return null;
  };

  const getBorderColor = () => {
    if (!value || value.trim().length === 0) {
      return "border-stone-300 dark:border-stone-600";
    }
    
    if (!validation.isValid || availability.isAvailable === false) {
      return "border-red-500 dark:border-red-400";
    }
    
    if (availability.isAvailable === true) {
      return "border-green-500 dark:border-green-400";
    }
    
    return "border-yellow-500 dark:border-yellow-400";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-black dark:text-white">
        {label}
      </label>
      
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-10 ${getBorderColor()} bg-white dark:bg-stone-800 text-black dark:text-white focus:ring-0`}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {getStatusIcon()}
        </div>
      </div>

      {/* Messaggio di stato */}
      <div className="min-h-[20px]">
        {getStatusMessage()}
      </div>

      {/* Preview URL slug */}
      {value && validation.isValid && (
        <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded border text-xs">
          <span className="text-stone-600 dark:text-stone-400">URL del profilo: </span>
          <code className="text-black dark:text-yellow-400 font-mono">
            https://bisiacaria.com/{validation.slug}
          </code>
        </div>
      )}
    </div>
  );
}