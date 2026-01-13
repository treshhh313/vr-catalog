import { motion, AnimatePresence } from 'framer-motion';

export function GameModal({ game, onClose }) {
    if (!game) return null;

    const videoPath = game.video;

    return (
        <AnimatePresence>
            {game && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-5xl bg-slate-900/95 border border-purple-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.2)] flex flex-col md:flex-row max-h-[90vh]"
                    >
                        {/* Left: Video Player */}
                        <div className="w-full md:w-2/3 bg-black relative">
                            <video
                                src={videoPath}
                                autoPlay
                                loop
                                muted
                                controls
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Right: Info */}
                        <div className="w-full md:w-1/3 p-8 flex flex-col relative overflow-y-auto">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white/50 hover:text-white p-2"
                            >
                                ✕
                            </button>

                            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-[family-name:var(--font-orbitron)] mb-2">
                                {game.name}
                            </h2>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {game.tags && game.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 rounded bg-slate-800 text-xs text-cyan-300 border border-cyan-900">
                                        {tag.toUpperCase()}
                                    </span>
                                ))}
                            </div>

                            <div className="space-y-4 text-slate-300 leading-relaxed overflow-y-auto pr-2">
                                {game.description && game.description.split('\n').map((paragraph, idx) => (
                                    <p key={idx}>{paragraph}</p>
                                ))}

                                <div className="mt-auto pt-6 border-t border-slate-700/50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-purple-400">👥 Игроков:</span>
                                        <span className="text-white font-semibold">{game.players || "1"}</span>
                                    </div>
                                    {game.time && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-purple-400">⏱️ Время:</span>
                                            <span className="text-white font-semibold">{game.time} мин</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="mt-8 w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 font-bold text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                            >
                                ЗАКРЫТЬ
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
