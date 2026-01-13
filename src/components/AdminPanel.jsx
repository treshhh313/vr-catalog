import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

export function AdminPanel({ isOpen, onClose, currentGames, onUpdate }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [games, setGames] = useState([]);
    const [editingGame, setEditingGame] = useState(null); // null = list, {} = new/edit
    const [videoFile, setVideoFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [status, setStatus] = useState('');
    const [availableTags, setAvailableTags] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setGames(currentGames || []);
            setIsAuthenticated(false);
            setPin('');
            setStatus('');

            // Extract all unique tags
            const tags = new Set();
            (currentGames || []).forEach(g => {
                if (g.tags) g.tags.forEach(t => tags.add(t));
            });
            setAvailableTags(Array.from(tags).sort());
        }
    }, [isOpen, currentGames]);

    const handleLogin = () => {
        if (pin === '1234') {
            setIsAuthenticated(true);
            setStatus('');
        } else {
            setStatus('Неверный PIN');
        }
    };

    const handleSave = async () => {
        setStatus('Сохранение...');
        try {
            let gameToSave = { ...editingGame };

            // 1. Handle ID generation
            if (!gameToSave.id) {
                gameToSave.id = gameToSave.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
            }

            // 2. Upload Video
            if (videoFile) {
                const newPath = await invoke('import_video', {
                    sourcePath: videoFile,
                    gameId: gameToSave.id
                });
                gameToSave.video = newPath; // Should be "/assets/videos/id.mp4"
            }

            // 3. Upload Image
            if (imageFile) {
                const newPath = await invoke('import_image', {
                    sourcePath: imageFile,
                    gameId: gameToSave.id
                });
                gameToSave.cover = newPath;
            }

            // 4. Update List
            let newGames;
            const sanitizedGame = { ...gameToSave };

            const existingIndex = games.findIndex(g => g.id === sanitizedGame.id);
            if (existingIndex >= 0) {
                newGames = [...games];
                newGames[existingIndex] = sanitizedGame;
            } else {
                newGames = [...games, sanitizedGame];
            }

            // 5. Save JSON
            await invoke('save_games_file', { jsonContent: JSON.stringify(newGames, null, 2) });

            setGames(newGames);
            setEditingGame(null);
            setVideoFile(null);
            setImageFile(null);
            setStatus('Успешно сохранено!');
            if (onUpdate) onUpdate();

        } catch (e) {
            console.error(e);
            setStatus('Ошибка при сохранении: ' + e);
        }
    };

    const handleReorder = async (newOrder) => {
        setGames(newOrder);
        // Debounce auto-save or save on release? 
        // For simplicity, let's add a "SAVE ORDER" button in main view instead of auto-saving every drag
    };

    const saveOrder = async () => {
        setStatus('Сохранение порядка...');
        try {
            await invoke('save_games_file', { jsonContent: JSON.stringify(games, null, 2) });
            setStatus('Порядок сохранен!');
            if (onUpdate) onUpdate();
        } catch (e) {
            setStatus('Ошибка: ' + e);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Вы уверены?')) return;
        const newGames = games.filter(g => g.id !== id);
        try {
            await invoke('save_games_file', { jsonContent: JSON.stringify(newGames, null, 2) });
            setGames(newGames);
            if (onUpdate) onUpdate();
        } catch (e) {
            setStatus('Ошибка удаления: ' + e);
        }
    };

    const selectFile = async (type) => {
        try {
            const selected = await open({
                multiple: false,
                filters: type === 'video'
                    ? [{ name: 'Video', extensions: ['mp4', 'webm'] }]
                    : [{ name: 'Image', extensions: ['jpg', 'png', 'jpeg', 'webp'] }]
            });
            if (selected) {
                if (type === 'video') setVideoFile(selected);
                else setImageFile(selected);
            }
        } catch (e) {
            setStatus('Ошибка выбора файла: ' + e);
        }
    };

    const toggleTag = (tag) => {
        const currentTags = editingGame.tags || [];
        if (currentTags.includes(tag)) {
            setEditingGame({ ...editingGame, tags: currentTags.filter(t => t !== tag) });
        } else {
            setEditingGame({ ...editingGame, tags: [...currentTags, tag] });
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
            >
                <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-xl p-8 shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col">

                    <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4 flex-shrink-0">
                        <h2 className="text-2xl font-bold text-white font-['Orbitron']">🛡️ ADMIN PANEL</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
                    </div>

                    {!isAuthenticated ? (
                        <div className="flex flex-col items-center gap-4 py-12">
                            <input
                                type="password"
                                value={pin}
                                onChange={e => setPin(e.target.value)}
                                className="bg-slate-800 text-white px-4 py-2 rounded text-center text-2xl tracking-widest border border-slate-600 focus:border-cyan-500 outline-none w-48"
                                placeholder="PIN"
                                autoFocus
                            />
                            <button
                                onClick={handleLogin}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded font-bold"
                            >
                                ВОЙТИ
                            </button>
                            {status && <p className="text-red-400">{status}</p>}
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            {status && <div className="mb-4 text-cyan-400 font-mono text-sm sticky top-0 bg-slate-900 z-10 py-2">{status}</div>}

                            {!editingGame ? (
                                <>
                                    <div className="flex justify-between mb-4 sticky top-0 bg-slate-900 z-10 py-2 border-b border-slate-800/50">
                                        <button
                                            onClick={saveOrder}
                                            className="text-xs font-mono text-slate-400 hover:text-cyan-400 border border-slate-700 px-3 py-1 rounded"
                                        >
                                            💾 СОХРАНИТЬ ПОРЯДОК
                                        </button>
                                        <button
                                            onClick={() => setEditingGame({ type: 'normal', players: "1", tags: [] })}
                                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 font-bold text-sm"
                                        >
                                            + ДОБАВИТЬ ИГРУ
                                        </button>
                                    </div>

                                    <div className="text-xs text-slate-500 mb-2 font-mono text-center">Перетащи, чтобы изменить порядок</div>

                                    <Reorder.Group axis="y" values={games} onReorder={handleReorder} className="space-y-1">
                                        {games.map(game => (
                                            <Reorder.Item key={game.id} value={game}>
                                                <div className="flex items-center bg-slate-800/50 border border-slate-700/50 p-3 rounded hover:bg-slate-800 cursor-grab active:cursor-grabbing">
                                                    <span className="text-slate-600 mr-4 text-xl">≡</span>
                                                    <div className="w-10 h-10 bg-slate-900 rounded mr-4 overflow-hidden flex-shrink-0">
                                                        {game.cover && <img src={game.cover} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-white truncate">{game.name}</div>
                                                        <div className="text-xs text-slate-500 font-mono">{game.id}</div>
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <button onClick={() => setEditingGame(game)} className="px-3 py-1 bg-cyan-900/30 text-cyan-400 rounded hover:bg-cyan-900/50 text-xs font-bold">EDIT</button>
                                                        <button onClick={() => handleDelete(game.id)} className="px-3 py-1 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 text-xs font-bold">DEL</button>
                                                    </div>
                                                </div>
                                            </Reorder.Item>
                                        ))}
                                    </Reorder.Group>
                                </>
                            ) : (
                                <div className="space-y-6 pb-8">
                                    <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
                                        <h3 className="text-lg font-bold text-white">
                                            {editingGame.id ? 'РЕДАКТИРОВАНИЕ' : 'НОВАЯ ИГРА'}
                                        </h3>
                                        <div className="text-xs font-mono text-slate-500">{editingGame.id || 'NEW'}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs uppercase text-slate-500 mb-1">Название игры</label>
                                                <input
                                                    value={editingGame.name || ''}
                                                    onChange={e => setEditingGame({ ...editingGame, name: e.target.value })}
                                                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-cyan-500 outline-none font-bold"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs uppercase text-slate-500 mb-1">Количество игроков (Текст)</label>
                                                <input
                                                    value={editingGame.players || ''}
                                                    onChange={e => setEditingGame({ ...editingGame, players: e.target.value })}
                                                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-cyan-500 outline-none"
                                                    placeholder="1-4"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs uppercase text-slate-500 mb-2">Обложка</label>
                                                <div className="flex gap-4">
                                                    <div className="w-24 h-32 bg-black rounded border border-slate-700 flex items-center justify-center overflow-hidden">
                                                        {(imageFile || editingGame.cover) ? (
                                                            <img src={imageFile ? "file-icon" : editingGame.cover} className="w-full h-full object-cover opactiy-50" alt="" />
                                                        ) : <span className="text-xs text-slate-600">Нет фото</span>}
                                                    </div>
                                                    <div className="flex flex-col justify-center gap-2">
                                                        <button onClick={() => selectFile('image')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs select-none">
                                                            ЗАГРУЗИТЬ ОБЛОЖКУ
                                                        </button>
                                                        <span className="text-[10px] text-slate-500 max-w-[150px] truncate">{imageFile || 'Файл не выбран'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs uppercase text-slate-500 mb-1">Описание</label>
                                                <textarea
                                                    value={editingGame.description || ''}
                                                    onChange={e => setEditingGame({ ...editingGame, description: e.target.value })}
                                                    className="w-full h-40 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:border-cyan-500 outline-none text-sm leading-relaxed"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs uppercase text-slate-500 mb-2">Видео Геймплея</label>
                                                <div className="bg-slate-800/50 p-3 rounded border border-slate-700 flex items-center justify-between">
                                                    <span className="text-xs text-slate-300 truncate max-w-[150px]">
                                                        {videoFile || (editingGame.video ? "✅ Видео загружено" : "❌ Нет видео")}
                                                    </span>
                                                    <button onClick={() => selectFile('video')} className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs">
                                                        ВЫБРАТЬ .MP4
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase text-slate-500 mb-2">Теги</label>
                                        <div className="flex flex-wrap gap-2 bg-slate-800/30 p-4 rounded border border-slate-700/50">
                                            {availableTags.map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => toggleTag(tag)}
                                                    className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${(editingGame.tags || []).includes(tag)
                                                        ? 'bg-cyan-600 border-cyan-500 text-white'
                                                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'
                                                        }`}
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const t = prompt('Новый тег:');
                                                    if (t) {
                                                        setAvailableTags([...availableTags, t.toUpperCase()]);
                                                        toggleTag(t.toUpperCase());
                                                    }
                                                }}
                                                className="px-3 py-1 rounded text-xs font-bold border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-white"
                                            >
                                                + NEW
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-4 pt-6 border-t border-slate-700 sticky bottom-0 bg-slate-900 py-4">
                                        <button
                                            onClick={() => { setEditingGame(null); setVideoFile(null); setImageFile(null); }}
                                            className="px-6 py-2 text-slate-400 hover:text-white"
                                        >
                                            ОТМЕНА
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="px-8 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold shadow-lg shadow-cyan-500/20"
                                        >
                                            СОХРАНИТЬ
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
