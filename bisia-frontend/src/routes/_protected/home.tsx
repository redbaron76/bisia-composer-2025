import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from '@/hooks/useAuth';
import { generateSlug } from '@/lib/slug-utils';

export const Route = createFileRoute("/_protected/home")({
  component: Home,
});

function Home() {
  const { user } = useAuth();
  const userSlug = user?.displayName ? generateSlug(user.displayName) : 'tuo-nickname';

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-stone-900 rounded-lg border-2 border-black dark:border-yellow-400 p-6">
        <h1 className="text-2xl font-bold text-black dark:text-yellow-400 mb-4">
          Benvenuto su Bisiacaria.com, {user?.displayName || 'Utente'}!
        </h1>
        <p className="text-black dark:text-white">
          Il social network dei bisiachi ti dà il benvenuto nella tua homepage personale.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Feed delle attività */}
        <div className="bg-white dark:bg-stone-900 rounded-lg border-2 border-black dark:border-yellow-400 p-6">
          <h2 className="text-xl font-bold text-black dark:text-yellow-400 mb-4">
            Attività recenti
          </h2>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-3 bg-stone-50 dark:bg-stone-800 rounded">
                <p className="text-sm text-black dark:text-white">
                  Attività placeholder {item}
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  2 ore fa
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Utenti online */}
        <div className="bg-white dark:bg-stone-900 rounded-lg border-2 border-black dark:border-yellow-400 p-6">
          <h2 className="text-xl font-bold text-black dark:text-yellow-400 mb-4">
            Bisiachi online
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-stone-300 dark:bg-stone-600 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">
                    Utente {item}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Online • {item === 1 ? '🟢' : item === 2 ? '🟡' : '🔴'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Link al profilo */}
      <div className="bg-white dark:bg-stone-900 rounded-lg border-2 border-black dark:border-yellow-400 p-6">
        <h2 className="text-xl font-bold text-black dark:text-yellow-400 mb-4">
          Il tuo profilo pubblico
        </h2>
        <p className="text-black dark:text-white mb-4">
          Il tuo profilo è visibile all'indirizzo:
        </p>
        <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded border">
          <code className="text-black dark:text-yellow-400">
            https://bisiacaria.com/{userSlug}
          </code>
        </div>
      </div>
    </div>
  );
}