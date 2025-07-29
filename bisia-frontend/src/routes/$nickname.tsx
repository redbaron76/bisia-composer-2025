import { createFileRoute, useParams, notFound } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { generateSlug, isReservedSlug } from '@/lib/slug-utils';
import { User, MapPin, Calendar, Heart, ThumbsDown } from 'lucide-react';

export const Route = createFileRoute('/$nickname')({
  component: ProfilePage,
  notFoundComponent: () => <div>Profilo non trovato</div>,
});

interface UserProfile {
  id: string;
  nickname: string;
  slug: string;
  avatar?: string;
  status: 'libero' | 'indeciso' | 'impegnato';
  location: string;
  birthDate: string;
  age: number;
  questions: Array<{
    question: string;
    answer: string;
  }>;
  preferences: {
    loves: string[];
    hates: string[];
  };
  isOnline: boolean;
  lastSeen?: string;
}

function ProfilePage() {
  const { nickname: slugParam } = useParams({ from: '/$nickname' });
  
  // Verifica se il parametro è uno slug riservato
  if (isReservedSlug(slugParam)) {
    throw notFound();
  }

  // Query per ottenere il profilo utente
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', slugParam],
    queryFn: async (): Promise<UserProfile> => {
      // TODO: Sostituire con chiamata API reale
      // const response = await fetch(`/api/users/profile/${slugParam}`);
      // if (!response.ok) throw new Error('Profile not found');
      // return response.json();
      
      // Simulazione per ora
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simula utente non trovato per alcuni slug
      if (['notfound', 'missing'].includes(slugParam)) {
        throw new Error('Profile not found');
      }
      
      return {
        id: '1',
        nickname: slugParam.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        slug: slugParam,
        avatar: '/placeholder-avatar.jpg',
        status: 'libero',
        location: 'Trieste',
        birthDate: '1990-01-01',
        age: 34,
        questions: [
          { question: "Cosa ti piace di più di Trieste?", answer: "La bora e il caffè!" },
          { question: "Il tuo piatto preferito?", answer: "Jota con crauti" }
        ],
        preferences: {
          loves: ['Mare', 'Caffè', 'Bora', 'Osmize', 'Friuli'],
          hates: ['Traffico', 'Caldo eccessivo', 'Folla', 'Ritardi', 'Rumore']
        },
        isOnline: true
      };
    },
    retry: false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-yellow-400 dark:bg-black font-['Montserrat'] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-yellow-400 mx-auto mb-4"></div>
          <p className="text-black dark:text-yellow-400">Caricamento profilo...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    throw notFound();
  }

  const statusColors = {
    libero: 'bg-green-500',
    indeciso: 'bg-yellow-500', 
    impegnato: 'bg-red-500'
  };

  const statusEmojis = {
    libero: '🟢',
    indeciso: '🟡',
    impegnato: '🔴'
  };

  return (
    <div className="min-h-screen bg-yellow-400 dark:bg-black font-['Montserrat']">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header del profilo */}
        <div className="bg-white dark:bg-stone-900 rounded-lg border-2 border-black dark:border-yellow-400 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-stone-300 dark:bg-stone-600 rounded-full flex items-center justify-center border-2 border-black dark:border-yellow-400">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.nickname}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-stone-500" />
                )}
              </div>
              {/* Status indicator */}
              <div className={`absolute -bottom-1 -right-1 w-8 h-8 ${statusColors[profile.status]} rounded-full border-2 border-white dark:border-stone-900 flex items-center justify-center`}>
                <span className="text-xs">{statusEmojis[profile.status]}</span>
              </div>
            </div>

            {/* Info principali */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-black dark:text-yellow-400 mb-2">
                {profile.nickname}
              </h1>
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">
                @{profile.slug}
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="flex items-center justify-center md:justify-start gap-2 text-black dark:text-white">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-black dark:text-white">
                  <Calendar className="w-4 h-4" />
                  <span>{profile.age} anni</span>
                </div>
              </div>

              <div className="mt-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  profile.isOnline 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200'
                }`}>
                  {profile.isOnline ? 'Online ora' : `Ultimo accesso: ${profile.lastSeen}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Domande e Risposte */}
          <div className="bg-white dark:bg-stone-900 rounded-lg border-2 border-black dark:border-yellow-400 p-6">
            <h2 className="text-xl font-bold text-black dark:text-yellow-400 mb-4">Q&A</h2>
            <div className="space-y-4">
              {profile.questions.map((qa, index) => (
                <div key={index} className="border-b border-stone-200 dark:border-stone-700 pb-3 last:border-b-0">
                  <p className="font-medium text-black dark:text-white mb-1">{qa.question}</p>
                  <p className="text-stone-600 dark:text-stone-400">{qa.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Preferenze */}
          <div className="bg-white dark:bg-stone-900 rounded-lg border-2 border-black dark:border-yellow-400 p-6">
            <h2 className="text-xl font-bold text-black dark:text-yellow-400 mb-4">Preferenze</h2>
            
            {/* Cose che ama */}
            <div className="mb-6">
              <h3 className="flex items-center gap-2 font-medium text-green-600 dark:text-green-400 mb-2">
                <Heart className="w-4 h-4" />
                Ama
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.preferences.loves.map((item, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Cose che odia */}
            <div>
              <h3 className="flex items-center gap-2 font-medium text-red-600 dark:text-red-400 mb-2">
                <ThumbsDown className="w-4 h-4" />
                Non sopporta
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.preferences.hates.map((item, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Azioni */}
        <div className="mt-6 bg-white dark:bg-stone-900 rounded-lg border-2 border-black dark:border-yellow-400 p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-2 bg-black dark:bg-yellow-400 text-yellow-400 dark:text-black font-medium rounded hover:bg-stone-800 dark:hover:bg-yellow-300 transition-colors">
              Conosci
            </button>
            <button className="px-6 py-2 border-2 border-black dark:border-yellow-400 text-black dark:text-yellow-400 font-medium rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
              Messaggio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}