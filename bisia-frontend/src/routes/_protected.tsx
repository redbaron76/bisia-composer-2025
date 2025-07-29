import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Users, Home, User, Calendar, Spade, Settings, LogOut } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export const Route = createFileRoute("/_protected")({
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const navigate = useNavigate();
  const { logoutMutation } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate({ to: "/" });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-400 dark:bg-black font-['Montserrat'] flex">
      {/* Left Sidebar - Desktop */}
      <div className="hidden lg:block w-64 bg-white dark:bg-stone-900 border-r-2 border-black dark:border-yellow-400">
        <div className="flex items-center justify-between p-4 border-b-2 border-black dark:border-yellow-400">
          <h2 className="text-lg font-bold text-black dark:text-yellow-400">Menu</h2>
        </div>
        
        <nav className="p-4">
          <ul className="flex w-full min-w-0 flex-col gap-1">
            <li className="group/menu-item relative">
              <a href="/home" className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-black text-black dark:text-white font-medium">
                <Home className="h-4 w-4 shrink-0" />
                <span className="truncate">Home</span>
              </a>
            </li>
            <li className="group/menu-item relative">
              <a href="/profile" className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-black text-black dark:text-white font-medium">
                <User className="h-4 w-4 shrink-0" />
                <span className="truncate">Mio Profilo</span>
              </a>
            </li>
            <li className="group/menu-item relative">
              <a href="/events" className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-black text-black dark:text-white font-medium">
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="truncate">Eventi</span>
              </a>
            </li>
            <li className="group/menu-item relative">
              <a href="/bis-poker" className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-black text-black dark:text-white font-medium">
                <Spade className="h-4 w-4 shrink-0" />
                <span className="truncate">Bis-Poker</span>
              </a>
            </li>
            <li className="group/menu-item relative">
              <a href="/settings" className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-black text-black dark:text-white font-medium">
                <Settings className="h-4 w-4 shrink-0" />
                <span className="truncate">Impostazioni</span>
              </a>
            </li>
            <li className="group/menu-item relative">
              <button 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] hover:bg-red-400 hover:text-white text-black dark:text-white font-medium disabled:opacity-50"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="truncate">{logoutMutation.isPending ? "Disconnessione..." : "Logout"}</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white dark:bg-stone-900 border-b-2 border-black dark:border-yellow-400 p-4 flex items-center justify-center lg:justify-between relative">
          {/* Left Drawer Trigger - Mobile */}
          <Drawer direction="left">
            <DrawerTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="lg:hidden absolute left-4 bg-white dark:bg-stone-900 border-2 border-black dark:border-yellow-400 text-black dark:text-yellow-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <Home className="h-4 w-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="w-64 bg-white dark:bg-stone-900 border-r-2 border-black dark:border-yellow-400">
              <DrawerHeader className="border-b-2 border-black dark:border-yellow-400">
                <DrawerTitle className="text-black dark:text-yellow-400">Menu</DrawerTitle>
                <DrawerClose asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute right-4 top-4 text-black dark:text-yellow-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    ✕
                  </Button>
                </DrawerClose>
              </DrawerHeader>
              <nav className="p-4">
                <ul className="flex w-full min-w-0 flex-col gap-1">
                  <li className="group/menu-item relative">
                    <a href="/home" className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-black text-black dark:text-white font-medium">
                      <Home className="h-4 w-4 shrink-0" />
                      <span className="truncate">Home</span>
                    </a>
                  </li>
                  <li className="group/menu-item relative">
                    <a href="/profile" className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-black text-black dark:text-white font-medium">
                      <User className="h-4 w-4 shrink-0" />
                      <span className="truncate">Mio Profilo</span>
                    </a>
                  </li>
                  <li className="group/menu-item relative">
                    <a href="/events" className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-black text-black dark:text-white font-medium">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span className="truncate">Eventi</span>
                    </a>
                  </li>
                  <li className="group/menu-item relative">
                    <a href="/bis-poker" className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-black text-black dark:text-white font-medium">
                      <Spade className="h-4 w-4 shrink-0" />
                      <span className="truncate">Bis-Poker</span>
                    </a>
                  </li>
                  <li className="group/menu-item relative">
                    <a href="/settings" className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-black text-black dark:text-white font-medium">
                      <Settings className="h-4 w-4 shrink-0" />
                      <span className="truncate">Impostazioni</span>
                    </a>
                  </li>
                  <li className="group/menu-item relative">
                    <button 
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] hover:bg-red-400 hover:text-white text-black dark:text-white font-medium disabled:opacity-50"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span className="truncate">{logoutMutation.isPending ? "Disconnessione..." : "Logout"}</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </DrawerContent>
          </Drawer>
          
          {/* Center Title */}
          <h1 className="text-xl font-bold text-black dark:text-yellow-400">
            Bisiacaria.com
          </h1>
          
          {/* Right Drawer Trigger - Mobile */}
          <Drawer direction="right">
            <DrawerTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="lg:hidden absolute right-4 bg-white dark:bg-stone-900 border-2 border-black dark:border-yellow-400 text-black dark:text-yellow-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <Users className="h-4 w-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="w-80 bg-white dark:bg-stone-900 border-l-2 border-black dark:border-yellow-400">
              <DrawerHeader className="border-b-2 border-black dark:border-yellow-400">
                <DrawerTitle className="text-black dark:text-yellow-400">Utenti Online</DrawerTitle>
                <DrawerClose asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute right-4 top-4 text-black dark:text-yellow-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    ✕
                  </Button>
                </DrawerClose>
              </DrawerHeader>
              <div className="p-4">
                {/* Search Form */}
                <div className="mb-6">
                  <Input
                    type="text"
                    placeholder="Cerca nickname..."
                    className="w-full mb-2 border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-black dark:text-white focus:border-black dark:focus:border-yellow-400 focus:ring-0"
                  />
                  
                  {/* Advanced Search Accordion */}
                  <details className="mt-2">
                    <summary className="text-sm text-black dark:text-yellow-400 font-medium cursor-pointer hover:underline">
                      Ricerca avanzata
                    </summary>
                    <div className="mt-3 space-y-3 p-3 bg-stone-50 dark:bg-stone-800 rounded">
                      <div>
                        <label className="block text-xs font-medium text-black dark:text-white mb-1">Età</label>
                        <div className="flex space-x-2">
                          <Input type="number" placeholder="Da" className="w-1/2 text-xs h-8" />
                          <Input type="number" placeholder="A" className="w-1/2 text-xs h-8" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-black dark:text-white mb-1">Località</label>
                        <Input type="text" placeholder="Città" className="w-full text-xs h-8" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-black dark:text-white mb-1">Genere</label>
                        <select className="w-full text-xs h-8 border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-black dark:text-white rounded">
                          <option value="">Tutti</option>
                          <option value="M">Maschile</option>
                          <option value="F">Femminile</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-black dark:text-white mb-1">Status</label>
                        <div className="flex space-x-1">
                          <button className="flex-1 text-xs py-1 px-2 bg-red-500 text-white rounded">🔴</button>
                          <button className="flex-1 text-xs py-1 px-2 bg-yellow-500 text-black rounded">🟡</button>
                          <button className="flex-1 text-xs py-1 px-2 bg-green-500 text-black rounded">🟢</button>
                        </div>
                      </div>
                      <Button className="w-full text-xs h-8 bg-black dark:bg-yellow-400 text-yellow-400 dark:text-black">
                        Cerca
                      </Button>
                    </div>
                  </details>
                </div>
                
                {/* Online Users List */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-black dark:text-white">Online ora (12)</h3>
                  
                  {/* Sample users */}
                  {[1, 2, 3, 4, 5].map((user) => (
                    <div key={user} className="flex items-center space-x-3 p-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded">
                      <div className="w-8 h-8 bg-stone-300 dark:bg-stone-600 rounded-full flex items-center justify-center text-xs">
                        👤
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black dark:text-white truncate">
                          User{user}
                        </p>
                        <p className="text-xs text-stone-600 dark:text-stone-400">
                          Online • {user === 1 ? '🟢' : user === 2 ? '🟡' : '🔴'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>

      {/* Right Sidebar - Desktop */}
      <div className="hidden lg:block w-80 bg-white dark:bg-stone-900 border-l-2 border-black dark:border-yellow-400">
        <div className="flex items-center justify-between p-4 border-b-2 border-black dark:border-yellow-400">
          <h2 className="text-lg font-bold text-black dark:text-yellow-400">Utenti Online</h2>
        </div>
        
        <div className="p-4">
          {/* Search Form */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Cerca nickname..."
              className="w-full mb-2 border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-black dark:text-white focus:border-black dark:focus:border-yellow-400 focus:ring-0"
            />
            
            {/* Advanced Search Accordion */}
            <details className="mt-2">
              <summary className="text-sm text-black dark:text-yellow-400 font-medium cursor-pointer hover:underline">
                Ricerca avanzata
              </summary>
              <div className="mt-3 space-y-3 p-3 bg-stone-50 dark:bg-stone-800 rounded">
                <div>
                  <label className="block text-xs font-medium text-black dark:text-white mb-1">Età</label>
                  <div className="flex space-x-2">
                    <Input type="number" placeholder="Da" className="w-1/2 text-xs h-8" />
                    <Input type="number" placeholder="A" className="w-1/2 text-xs h-8" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-black dark:text-white mb-1">Località</label>
                  <Input type="text" placeholder="Città" className="w-full text-xs h-8" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black dark:text-white mb-1">Genere</label>
                  <select className="w-full text-xs h-8 border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-black dark:text-white rounded">
                    <option value="">Tutti</option>
                    <option value="M">Maschile</option>
                    <option value="F">Femminile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-black dark:text-white mb-1">Status</label>
                  <div className="flex space-x-1">
                    <button className="flex-1 text-xs py-1 px-2 bg-red-500 text-white rounded">🔴</button>
                    <button className="flex-1 text-xs py-1 px-2 bg-yellow-500 text-black rounded">🟡</button>
                    <button className="flex-1 text-xs py-1 px-2 bg-green-500 text-black rounded">🟢</button>
                  </div>
                </div>
                <Button className="w-full text-xs h-8 bg-black dark:bg-yellow-400 text-yellow-400 dark:text-black">
                  Cerca
                </Button>
              </div>
            </details>
          </div>
          
          {/* Online Users List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-black dark:text-white">Online ora (12)</h3>
            
            {/* Sample users */}
            {[1, 2, 3, 4, 5].map((user) => (
              <div key={user} className="flex items-center space-x-3 p-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded">
                <div className="w-8 h-8 bg-stone-300 dark:bg-stone-600 rounded-full flex items-center justify-center text-xs">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black dark:text-white truncate">
                    User{user}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Online • {user === 1 ? '🟢' : user === 2 ? '🟡' : '🔴'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}