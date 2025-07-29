/**
 * Utility functions for nickname slug generation and validation
 */

// Lista completa di slug riservati
export const RESERVED_SLUGS = [
  // Application routes
  'home', 'settings', 'events', 'bis-poker', 'profile',
  // Authentication routes  
  'login', 'register', 'signup', 'logout', 'auth', 'signin',
  // System routes
  'api', 'admin', 'dashboard', 'app', 'www', 'root',
  // Common reserved words
  'help', 'support', 'contact', 'about', 'terms', 'privacy',
  'search', 'explore', 'discover', 'notifications', 'faq',
  // Technical routes
  'assets', 'static', 'public', 'uploads', 'images', 'files',
  'js', 'css', 'fonts', 'favicon', 'robots', 'sitemap',
  // Social/Community features
  'feed', 'timeline', 'messages', 'chat', 'groups', 'friends',
  // Bisiacaria specific
  'bisiacaria', 'bisiachi', 'community', 'social',
  // Other common conflicts
  'user', 'users', 'account', 'accounts', 'config', 'system'
] as const;

/**
 * Converte un nickname in slug URL-friendly
 * @param nickname - Il nickname originale
 * @returns Lo slug generato
 */
export function generateSlug(nickname: string): string {
  return nickname
    .toLowerCase()
    .trim()
    // Sostituisce spazi e caratteri speciali con trattini
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Verifica se uno slug è riservato
 * @param slug - Lo slug da verificare
 * @returns true se lo slug è riservato
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase() as any);
}

/**
 * Valida un nickname controllando se il suo slug è riservato
 * @param nickname - Il nickname da validare
 * @returns Oggetto con risultato validazione e messaggio
 */
export function validateNickname(nickname: string): {
  isValid: boolean;
  slug: string;
  error?: string;
  suggestions?: string[];
} {
  if (!nickname || nickname.trim().length === 0) {
    return {
      isValid: false,
      slug: '',
      error: 'Il nickname non può essere vuoto'
    };
  }

  if (nickname.trim().length < 2) {
    return {
      isValid: false,
      slug: generateSlug(nickname),
      error: 'Il nickname deve avere almeno 2 caratteri'
    };
  }

  if (nickname.trim().length > 30) {
    return {
      isValid: false,
      slug: generateSlug(nickname),
      error: 'Il nickname non può superare i 30 caratteri'
    };
  }

  const slug = generateSlug(nickname);

  if (!slug || slug.length === 0) {
    return {
      isValid: false,
      slug,
      error: 'Il nickname contiene solo caratteri non validi'
    };
  }

  if (isReservedSlug(slug)) {
    return {
      isValid: false,
      slug,
      error: `Il nickname "${nickname}" genera l'URL "/${slug}" che è riservato dal sistema`,
      suggestions: generateAlternativeSlugs(slug)
    };
  }

  return {
    isValid: true,
    slug
  };
}

/**
 * Genera suggerimenti alternativi per slug riservati
 * @param baseSlug - Lo slug base riservato
 * @returns Array di suggerimenti alternativi
 */
export function generateAlternativeSuggestions(nickname: string): string[] {
  const baseSlug = generateSlug(nickname);
  
  return [
    `${nickname}2024`,
    `${nickname}_user`,
    `${nickname}.official`,
    `my${nickname}`,
    `${nickname}bisia`
  ].filter(suggestion => {
    const suggestionSlug = generateSlug(suggestion);
    return !isReservedSlug(suggestionSlug);
  });
}

/**
 * Genera slug alternativi per uno slug riservato
 * @param slug - Lo slug riservato
 * @returns Array di alternative
 */
function generateAlternativeSlugs(slug: string): string[] {
  return [
    `${slug}2024`,
    `${slug}-user`,
    `my-${slug}`,
    `${slug}-bisia`,
    `${slug}-official`
  ];
}

/**
 * Verifica se uno slug è valido per l'URL (caratteri consentiti)
 * @param slug - Lo slug da verificare
 * @returns true se lo slug ha caratteri validi
 */
export function isValidSlugFormat(slug: string): boolean {
  // Solo lettere minuscole, numeri e trattini
  // Non può iniziare o finire con trattino
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Funzione completa di validazione per uso in form
 * @param nickname - Il nickname da validare
 * @returns Risultato completo della validazione
 */
export function validateNicknameForRegistration(nickname: string) {
  const validation = validateNickname(nickname);
  
  if (!validation.isValid) {
    return validation;
  }

  // Controllo aggiuntivo sul formato dello slug
  if (!isValidSlugFormat(validation.slug)) {
    return {
      isValid: false,
      slug: validation.slug,
      error: 'Il nickname contiene caratteri non consentiti negli URL'
    };
  }

  return validation;
}