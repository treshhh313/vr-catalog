import { motion } from 'framer-motion';
import { GameCard } from './GameCard';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export function GameGrid({ games, onCardClick }) {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6 pb-32"
        >
            {games.map(game => (
                <motion.div key={game.id} variants={item}>
                    <GameCard game={game} onClick={onCardClick} />
                </motion.div>
            ))}
        </motion.div>
    );
}
