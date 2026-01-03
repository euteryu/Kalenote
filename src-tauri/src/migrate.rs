use rusqlite::{Connection, Result};
use std::path::PathBuf;
use tauri::AppHandle;

pub fn migrate_db(app: &AppHandle) -> Result<()> {
    let app_dir = app.path_resolver()
        .app_data_dir()
        .expect("Failed to get app data directory");
    
    std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
    
    let db_path = app_dir.join("kalenote.db");
    let conn = Connection::open(db_path)?;
    
    // Check if tasks table has corrupted status data
    let mut stmt = conn.prepare("SELECT id, status FROM tasks")?;
    let tasks: Vec<(i64, String)> = stmt
        .query_map([], |row| {
            Ok((row.get(0)?, row.get(1)?))
        })?
        .filter_map(|r| r.ok())
        .collect();
    
    // Fix corrupted status values (integers stored as strings)
    for (id, status_str) in tasks {
        if status_str.parse::<i32>().is_ok() {
            // Status is stored as integer string, default to 'inbox'
            conn.execute("UPDATE tasks SET status = 'inbox' WHERE id = ?", [id])?;
            println!("Fixed corrupted status for task {}", id);
        }
    }
    
    Ok(())
}
