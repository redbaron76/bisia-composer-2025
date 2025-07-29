import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/bis-poker")({
  component: BisPoker,
});

function BisPoker() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-stone-900 rounded-lg border-2 border-black dark:border-yellow-400 p-6">
        <h1 className="text-2xl font-bold text-black dark:text-yellow-400 mb-4">
          Bis-Poker
        </h1>
        <p className="text-black dark:text-white">
          Torneo settimanale di video-poker per la comunità.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-900 rounded-lg border-2 border-black dark:border-yellow-400 p-6">
          <h2 className="text-xl font-bold text-black dark:text-yellow-400 mb-4">
            Classifica Settimanale
          </h2>
          <p className="text-black dark:text-white">
            Classifica in arrivo...
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-lg border-2 border-black dark:border-yellow-400 p-6">
          <h2 className="text-xl font-bold text-black dark:text-yellow-400 mb-4">
            I tuoi Crediti
          </h2>
          <div className="text-center">
            <p className="text-3xl font-bold text-black dark:text-yellow-400">1000</p>
            <p className="text-black dark:text-white">Crediti giornalieri</p>
          </div>
        </div>
      </div>
    </div>
  );
}