import { motion } from 'framer-motion';

export function GameCard({ game, onClick }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onClick(game)}
            className="relative group cursor-pointer rounded-xl overflow-hidden bg-slate-900 border border-slate-700/50 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all duration-300 flex flex-col h-full"
        >
            {/* Image Container */}
            <div className="aspect-[4/5] w-full overflow-hidden relative border-b border-slate-800 bg-slate-950/40 p-3">
                <img
                    src={game.cover}
                    alt={game.name}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                    loading="lazy"
                />
            </div>

            {/* Content Area */}
            <div className="p-4 flex flex-col flex-grow bg-gradient-to-br from-slate-900 to-slate-950">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                        {game.genre || 'GAME'}
                    </span>
                    {game.players && (
                        <span className="text-[10px] text-slate-500 font-medium">
                            👥 {game.players}
                        </span>
                    )}
                </div>

                <h3 className="text-white text-lg font-black font-[family-name:var(--font-outfit)] leading-tight group-hover:text-cyan-300 transition-colors line-clamp-2 uppercase tracking-tight">
                    {game.name}
                </h3>
            </div>
        </motion.div>
    );
}
