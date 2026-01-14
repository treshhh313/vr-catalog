use std::fs;
use std::path::Path;
use tauri::command;

#[command]
pub fn save_games_file(json_content: String) -> Result<(), String> {
    // Determine the project root. The binary runs inside src-tauri/target/debug/
    // so we need to go up several levels to find 'public'.
    // A safer way in dev mode (npm run tauri dev) inside the project folder
    // is to rely on the fact that we launched from the root.
    // However, the Rust side might see CWD as src-tauri.

    // Let's try to resolve absolute path relative to `package.json` location if possible,
    // or just try multiple locations.

    let mut path = Path::new("../public/games.json");
    if !path.exists() {
        // Try current directory (if running from root)
        path = Path::new("public/games.json");
    }

    // Safety check: if we are deeper in target/debug
    let fallback = Path::new("../../public/games.json");
    if !path.exists() && fallback.exists() {
        path = fallback;
    }

    // Attempt to write
    fs::write(path, json_content)
        .map_err(|e| format!("Failed to write games.json to {:?}: {}", path, e))
}

#[command]
pub fn import_video(source_path: String, game_id: String) -> Result<String, String> {
    let source = Path::new(&source_path);
    if !source.exists() {
        return Err("Source file does not exist".to_string());
    }

    // New Destination: public/assets/games/{id}/video.mp4
    let candidates = vec![
        "../public/assets/games",
        "public/assets/games",
        "../../public/assets/games",
    ];

    let mut games_dir = Path::new("../public/assets/games");
    for c in &candidates {
        let p = Path::new(c);
        if p.exists() {
            games_dir = p;
            break;
        }
    }

    let game_folder = games_dir.join(&game_id);
    if !game_folder.exists() {
        fs::create_dir_all(&game_folder)
            .map_err(|e| format!("Failed to create game directory: {}", e))?;
    }

    let dest_path = game_folder.join("video.mp4");

    fs::copy(source, &dest_path).map_err(|e| format!("Failed to copy video file: {}", e))?;

    Ok(format!("assets/games/{}/video.mp4", game_id))
}

#[command]
pub fn import_image(source_path: String, game_id: String) -> Result<String, String> {
    let source = Path::new(&source_path);
    if !source.exists() {
        return Err("Source file does not exist".to_string());
    }

    let extension = source.extension().and_then(|e| e.to_str()).unwrap_or("jpg");

    let candidates = vec![
        "../public/assets/games",
        "public/assets/games",
        "../../public/assets/games",
    ];

    let mut games_dir = Path::new("../public/assets/games");
    for c in &candidates {
        let p = Path::new(c);
        if p.exists() {
            games_dir = p;
            break;
        }
    }

    let game_folder = games_dir.join(&game_id);
    if !game_folder.exists() {
        fs::create_dir_all(&game_folder)
            .map_err(|e| format!("Failed to create game directory: {}", e))?;
    }

    let dest_filename = format!("cover.{}", extension);
    let dest_path = game_folder.join(&dest_filename);

    fs::copy(source, &dest_path).map_err(|e| format!("Failed to copy image file: {}", e))?;

    Ok(format!("assets/games/{}/{}", game_id, dest_filename))
}
