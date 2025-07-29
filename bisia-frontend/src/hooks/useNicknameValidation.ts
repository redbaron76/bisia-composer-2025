import { useState, useEffect } from 'react';
import { validateNicknameForRegistration, generateSlug, generateAlternativeSuggestions } from '@/lib/slug-utils';

export interface NicknameValidationResult {
  isValid: boolean;
  slug: string;
  error?: string;
  suggestions?: string[];
  isLoading: boolean;
}

/**
 * Hook per validazione nickname in tempo reale
 * @param nickname - Il nickname da validare
 * @param debounceMs - Millisecondi di debounce (default: 300)
 * @returns Risultato della validazione
 */
export function useNicknameValidation(
  nickname: string, 
  debounceMs: number = 300
): NicknameValidationResult {
  const [result, setResult] = useState<NicknameValidationResult>({
    isValid: false,
    slug: '',
    isLoading: false
  });

  useEffect(() => {
    if (!nickname || nickname.trim().length === 0) {
      setResult({
        isValid: false,
        slug: '',
        isLoading: false
      });
      return;
    }

    setResult(prev => ({ ...prev, isLoading: true }));

    const timeoutId = setTimeout(() => {
      const validation = validateNicknameForRegistration(nickname);
      
      setResult({
        isValid: validation.isValid,
        slug: validation.slug,
        error: validation.error,
        suggestions: validation.suggestions || generateAlternativeSuggestions(nickname),
        isLoading: false
      });
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [nickname, debounceMs]);

  return result;
}

/**
 * Hook per controllo disponibilità nickname via API
 * @param nickname - Il nickname da verificare
 * @returns Stato della verifica
 */
export function useNicknameAvailability(nickname: string) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = async (nicknameToCheck: string) => {
    if (!nicknameToCheck || nicknameToCheck.trim().length === 0) {
      setIsAvailable(null);
      return;
    }

    const validation = validateNicknameForRegistration(nicknameToCheck);
    if (!validation.isValid) {
      setIsAvailable(false);
      setError(validation.error || 'Nickname non valido');
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      // TODO: Sostituire con chiamata API reale
      // const response = await fetch(`/api/users/check-nickname/${validation.slug}`);
      // const data = await response.json();
      
      // Simulazione per ora
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simuliamo che alcuni nickname sono già presi
      const takenSlugs = ['mario', 'luigi', 'test', 'admin'];
      const isTaken = takenSlugs.includes(validation.slug);
      
      setIsAvailable(!isTaken);
      if (isTaken) {
        setError(`Il nickname "${nicknameToCheck}" (${validation.slug}) è già in uso`);
      }
    } catch (err) {
      setError('Errore durante la verifica del nickname');
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkAvailability(nickname);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [nickname]);

  return {
    isChecking,
    isAvailable,
    error,
    checkAvailability
  };
}