import { motion } from 'framer-motion';

export function FilterBar({ tags, currentFilter, onFilterChange, activeFilterDisplay }) {
    return (
        <div className="flex flex-wrap gap-2 p-4 justify-center">
            <FilterButton
                label="Все"
                active={activeFilterDisplay === 'Все'}
                onClick={() => onFilterChange('Все')}
            />

            {tags.map(tag => (
                <FilterButton
                    key={tag}
                    label={tag.toUpperCase()}
                    active={currentFilter === tag}
                    onClick={() => onFilterChange(tag)}
                />
            ))}
        </div>
    );
}

function FilterButton({ label, active, onClick }) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`
        px-6 py-2 rounded-full text-sm font-bold tracking-wider transition-all duration-300
        ${active
                    ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-105 border-purple-400'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-transparent hover:border-slate-600'}
        border
      `}
        >
            {label}
        </motion.button>
    );
}
