import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/events")({
  component: Events,
});

function Events() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-stone-900 rounded-lg border-2 border-black dark:border-yellow-400 p-6">
        <h1 className="text-2xl font-bold text-black dark:text-yellow-400 mb-4">
          Calendario Eventi
        </h1>
        <p className="text-black dark:text-white">
          Scopri e partecipa agli eventi della comunità bisiaca.
        </p>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-lg border-2 border-black dark:border-yellow-400 p-6">
        <h2 className="text-xl font-bold text-black dark:text-yellow-400 mb-4">
          Prossimi Eventi
        </h2>
        <p className="text-black dark:text-white">
          Sistema eventi in sviluppo...
        </p>
      </div>
    </div>
  );
}