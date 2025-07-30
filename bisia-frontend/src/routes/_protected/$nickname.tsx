import { createFileRoute, useParams, notFound } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { generateSlug, isReservedSlug } from '@/lib/slug-utils';
import { User, MapPin, Calendar, Heart, ThumbsDown } from 'lucide-react';

export const Route = createFileRoute('/_protected/$nickname')({
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
  const { nickname: slugParam } = useParams({ from: '/_protected/$nickname' });
  
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
      <div className="flex items-center justify-center min-h-96">
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
    <div className="space-y-8">
      {/* Header del profilo */}
      <div className="glass-card dark:glass-card-dark rounded-3xl p-8 floating-card">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-40 h-40 glass dark:glass-dark rounded-full flex items-center justify-center border-2 border-white/30 dark:border-yellow-400/30 backdrop-blur-sm">
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt={profile.nickname}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-20 h-20 text-black/60 dark:text-white/60" />
              )}
            </div>
            {/* Status indicator */}
            <div className={`absolute -bottom-2 -right-2 w-12 h-12 ${statusColors[profile.status]} rounded-full border-4 border-white/80 dark:border-black/80 flex items-center justify-center backdrop-blur-sm`}>
              <span className="text-lg">{statusEmojis[profile.status]}</span>
            </div>
          </div>

          {/* Info principali */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold gradient-text dark:gradient-text-dark mb-3">
              {profile.nickname}
            </h1>
            <p className="text-lg text-black/70 dark:text-white/70 mb-2 font-medium">
              @{profile.slug}
            </p>
            
            <div className="flex flex-col md:flex-row gap-6 mt-6">
              <div className="flex items-center justify-center md:justify-start gap-3 text-black dark:text-white glass dark:glass-dark rounded-2xl p-3 backdrop-blur-sm">
                <MapPin className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="font-medium">{profile.location}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 text-black dark:text-white glass dark:glass-dark rounded-2xl p-3 backdrop-blur-sm">
                <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="font-medium">{profile.age} anni</span>
              </div>
            </div>

            <div className="mt-6">
              <span className={`inline-flex items-center px-6 py-3 rounded-2xl text-base font-semibold backdrop-blur-sm ${
                profile.isOnline 
                  ? 'bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30' 
                  : 'bg-stone-500/20 text-stone-700 dark:text-stone-300 border border-stone-500/30'
              }`}>
                {profile.isOnline ? '🟢 Online ora' : `🔴 Ultimo accesso: ${profile.lastSeen}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Domande e Risposte */}
        <div className="glass-card dark:glass-card-dark rounded-3xl p-8 floating-card">
          <h2 className="text-2xl font-bold gradient-text dark:gradient-text-dark mb-6">Q&A</h2>
          <div className="space-y-6">
            {profile.questions.map((qa, index) => (
              <div key={index} className="glass dark:glass-dark rounded-2xl p-4 backdrop-blur-sm">
                <p className="font-semibold text-black dark:text-white mb-2 text-lg">{qa.question}</p>
                <p className="text-black/70 dark:text-white/70 text-base">{qa.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Preferenze */}
        <div className="glass-card dark:glass-card-dark rounded-3xl p-8 floating-card">
          <h2 className="text-2xl font-bold gradient-text dark:gradient-text-dark mb-6">Preferenze</h2>
          
          {/* Cose che ama */}
          <div className="mb-8">
            <h3 className="flex items-center gap-3 font-semibold text-green-600 dark:text-green-400 mb-4 text-lg">
              <Heart className="w-6 h-6" />
              Ama
            </h3>
            <div className="flex flex-wrap gap-3">
              {profile.preferences.loves.map((item, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-green-500/20 text-green-700 dark:text-green-300 rounded-2xl text-base font-medium backdrop-blur-sm border border-green-500/30 hover:scale-105 transition-transform cursor-pointer"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Cose che odia */}
          <div>
            <h3 className="flex items-center gap-3 font-semibold text-red-600 dark:text-red-400 mb-4 text-lg">
              <ThumbsDown className="w-6 h-6" />
              Non sopporta
            </h3>
            <div className="flex flex-wrap gap-3">
              {profile.preferences.hates.map((item, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-red-500/20 text-red-700 dark:text-red-300 rounded-2xl text-base font-medium backdrop-blur-sm border border-red-500/30 hover:scale-105 transition-transform cursor-pointer"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Azioni */}
      <div className="glass-card dark:glass-card-dark rounded-3xl p-8 floating-card">
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-2xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm">
            🤝 Conosci
          </button>
          <button className="px-8 py-4 glass dark:glass-dark border-2 border-yellow-400/50 text-black dark:text-yellow-400 font-bold text-lg rounded-2xl hover:bg-yellow-400/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
            💬 Messaggio
          </button>
        </div>
      </div>
    </div>
  );
}