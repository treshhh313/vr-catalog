import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameData } from './hooks/useGameData';

import { FilterBar } from './components/FilterBar';
import { GameGrid } from './components/GameGrid';
import { GameModal } from './components/GameModal';
import { AdminPanel } from './components/AdminPanel';

function App() {
  const { games, tags, loading, refresh } = useGameData();
  const [filter, setFilter] = useState('ALL');
  const [selectedGame, setSelectedGame] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [blockingClick, setBlockingClick] = useState(false);
  const idleTimerRef = useRef(null);

  const resetIdleTimer = () => {
    if (isIdle) {
      setBlockingClick(true);
      setTimeout(() => setBlockingClick(false), 200);
      setIsIdle(false);
    }
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (games.length > 0) {
        setCurrentVideoIndex(Math.floor(Math.random() * games.length));
      }
      setIsIdle(true);
    }, 180000); // 3 minutes
  };

  useEffect(() => {
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);
    resetIdleTimer();
    return () => {
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  const filteredGames = useMemo(() => {
    if (filter === 'ALL') return games;
    return games.filter(g => g.tags && g.tags.includes(filter));
  }, [games, filter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0a1a]">
        <div className="text-cyan-500 font-bold tracking-[0.3em] animate-pulse font-['Orbitron'] text-xl">
          INITIALIZING NEURO-LINK...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-200 selection:bg-purple-500/30 bg-[#0f0a1a] overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none">
        {/* Cyberpunk Background */}
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen" style={{ backgroundImage: "url('/assets/cyberpunk_bg.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 via-[#0f0a1a]/50 to-[#0f0a1a]/90" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-600/20 to-transparent blur-3xl pointer-events-none" />
      </div>

      {blockingClick && (
        <div className="fixed inset-0 z-[150] bg-transparent pointer-events-auto cursor-none" />
      )}

      {isIdle ? (
        <div
          className="fixed inset-0 z-[100] bg-black cursor-none"
          onPointerDown={(e) => {
            e.stopPropagation();
            resetIdleTimer();
          }}
        >
          <video
            src={games[currentVideoIndex]?.video || ""}
            autoPlay
            muted
            onEnded={() => setCurrentVideoIndex(prev => (prev + 1) % games.length)}
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 flex items-end justify-center pb-32 pointer-events-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [0.9, 1.1, 0.9],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-10 flex flex-col items-center gap-8"
            >
              <div className="relative">
                {/* Outer Pulse Rings */}
                <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping [animation-duration:3s]" />
                <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-ping [animation-duration:3s] [animation-delay:1s]" />

                {/* Tap Icon Container - Dark glassmorphism for contrast against video */}
                <div className="relative bg-black/60 backdrop-blur-xl p-8 rounded-full border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.5)] flex items-center justify-center">
                  {/* Custom Hand Tap Icon Image */}
                  <img
                    src="/assets/tap_icon.svg"
                    alt="Tap Icon"
                    className="w-16 h-16 invert brightness-200"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="h-1.5 w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <>
          {/* Premium Header */}
          <header className="px-8 py-6 md:px-12 md:py-10 relative z-30 flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/20 backdrop-blur-md gap-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-6">
                <h1
                  onDoubleClick={() => setIsIdle(true)}
                  className="text-xl md:text-2xl font-black font-[family-name:var(--font-orbitron)] tracking-tighter filter drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] cursor-pointer select-none"
                >
                  <span className="text-white">VR</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-cyan-400 bg-[length:300%_auto] ml-2 animate-shimmer">
                    CLUB
                  </span>
                </h1>
                <span className="text-slate-700 text-4xl font-thin select-none hidden md:inline opacity-20">|</span>
                <h2
                  onClick={() => {
                    const newCount = clickCount + 1;
                    setClickCount(newCount);
                    if (newCount >= 3) {
                      setShowAdmin(true);
                      setClickCount(0);
                    }
                    setTimeout(() => setClickCount(0), 1000); // Reset if too slow
                  }}
                  className="text-3xl md:text-4xl font-black font-[family-name:var(--font-orbitron)] tracking-[0.15em] uppercase relative select-none cursor-pointer"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-200 to-slate-200 filter drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                    КАТАЛОГ ИГР
                  </span>
                </h2>
              </div>
              <div className="h-[3px] w-full max-w-[500px] bg-gradient-to-r from-cyan-400 via-purple-500 to-transparent mt-5 rounded-full" />
            </div>

          </header>

          {/* Controls */}
          <div className="sticky top-0 z-20 bg-[#0f0a1a]/60 backdrop-blur-xl border-b border-white/5 py-2">
            <FilterBar
              tags={tags}
              currentFilter={filter}
              onFilterChange={(f) => setFilter(f === 'Все' ? 'ALL' : f)}
              activeFilterDisplay={filter === 'ALL' ? 'Все' : filter}
            />
          </div>

          {/* Grid */}
          <main className="container mx-auto max-w-7xl relative z-10">
            <AnimatePresence mode="wait">
              {games.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-[50vh] text-slate-500 font-['Orbitron'] space-y-4"
                >
                  <p className="text-2xl tracking-[0.2em]">NO GAMES DETECTED</p>
                  <p className="text-xs font-mono text-slate-600">Please check resources/games.json and verify the resource path in tauri.conf.json</p>
                </motion.div>
              ) : (
                <GameGrid key={filter} games={filteredGames} onCardClick={setSelectedGame} />
              )}
            </AnimatePresence>
          </main>

          {/* Modal */}
          {selectedGame && (
            <GameModal
              game={selectedGame}
              onClose={() => setSelectedGame(null)}
            />
          )}


          {/* Admin Panel */}
          <AdminPanel
            isOpen={showAdmin}
            onClose={() => setShowAdmin(false)}
            currentGames={games}
            onUpdate={refresh}
          />

          {/* Simple Footer/Status */}
          <div className="fixed bottom-6 right-8 text-[10px] text-slate-500 font-mono tracking-widest uppercase bg-black/40 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md">
            CORE: STABLE <span className="mx-2">|</span> OBJECTS: {games.length} <span className="mx-2">|</span> V-LINK: ACTIVE
          </div>
        </>
      )
      }
    </div >
  );
}

export default App;
