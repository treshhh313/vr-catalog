import { useState, useEffect } from 'react';

export function useGameData() {
    const [games, setGames] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/games.json');
            // Add timestamp to bypass cache if needed, though fetch default might be fine
            // const response = await fetch(`/games.json?t=${Date.now()}`); 

            if (!response.ok) throw new Error('Failed to load games.json');

            const data = await response.json();

            const allTags = new Set();
            data.forEach(game => {
                if (game.tags && Array.isArray(game.tags)) {
                    game.tags.forEach(tag => allTags.add(tag));
                }
            });

            setGames(data);
            setTags(Array.from(allTags).sort());
        } catch (e) {
            console.error("Game loading error:", e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return { games, tags, loading, refresh: loadData };
}
