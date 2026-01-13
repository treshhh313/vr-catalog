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

    // Destination: ../public/assets/videos/{id}.mp4
    // Simple, consistent path relative to where we run dev from.
    let dest_dir = Path::new("../public/assets/videos");

    // Fallback if running from root
    let root_dest = Path::new("public/assets/videos");

    let final_dest_dir = if dest_dir.parent().unwrap().exists() {
        dest_dir
    } else {
        root_dest
    };

    if !final_dest_dir.exists() {
        fs::create_dir_all(final_dest_dir)
            .map_err(|e| format!("Failed to create videos directory: {}", e))?;
    }

    let dest_filename = format!("{}.mp4", game_id);
    let dest_path = final_dest_dir.join(&dest_filename);

    fs::copy(source, &dest_path).map_err(|e| format!("Failed to copy video file: {}", e))?;

    // Return the web-accessible relative path
    Ok(format!("/assets/videos/{}", dest_filename))
}

#[command]
pub fn import_image(source_path: String, game_id: String) -> Result<String, String> {
    let source = Path::new(&source_path);
    if !source.exists() {
        return Err("Source file does not exist".to_string());
    }

    let extension = source.extension().and_then(|e| e.to_str()).unwrap_or("jpg");

    // Robustly find public/assets/covers
    let candidates = vec![
        "../public/assets/covers",
        "public/assets/covers",
        "../../public/assets/covers",
    ];

    let mut dest_dir_path = Path::new("../public/assets/covers");
    for c in &candidates {
        let p = Path::new(c);
        // Check if 'assets' exists parent to covers
        if let Some(parent) = p.parent() {
            if parent.exists() {
                dest_dir_path = p;
                break;
            }
        }
    }

    if !dest_dir_path.exists() {
        fs::create_dir_all(dest_dir_path)
            .map_err(|e| format!("Failed to create covers directory: {}", e))?;
    }

    let dest_filename = format!("{}.{}", game_id, extension);
    let dest_path = dest_dir_path.join(&dest_filename);

    fs::copy(source, &dest_path).map_err(|e| format!("Failed to copy image file: {}", e))?;

    Ok(format!("/assets/covers/{}", dest_filename))
}
