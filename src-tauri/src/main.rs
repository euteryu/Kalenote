// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;

use database::{Database, NewTask, Task, Settings, CalendarPreset, NewCalendarPreset};
use std::sync::Mutex;
use tauri::State;

struct AppState {
    db: Mutex<Database>,
}

// Task commands
#[tauri::command]
fn get_all_tasks(state: State<AppState>) -> Result<Vec<Task>, String> {
    let db = state.db.lock().unwrap();
    db.get_all_tasks().map_err(|e| e.to_string())
}

#[tauri::command]
fn add_task(task: NewTask, state: State<AppState>) -> Result<i64, String> {
    let db = state.db.lock().unwrap();
    db.add_task(task).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_task(
    id: i64,
    content: Option<String>,
    status: Option<String>,
    priority: Option<i32>,
    tags: Option<String>,
    time_duration: Option<i32>,
    due_date: Option<String>,
    completed_at: Option<String>,
    state: State<AppState>,
) -> Result<(), String> {
    let db = state.db.lock().unwrap();
    db.update_task(id, content, status, priority, tags, time_duration, due_date, completed_at)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_task(id: i64, state: State<AppState>) -> Result<(), String> {
    let db = state.db.lock().unwrap();
    db.delete_task(id).map_err(|e| e.to_string())
}

#[tauri::command]
fn clear_column(status: String, state: State<AppState>) -> Result<(), String> {
    let db = state.db.lock().unwrap();
    db.clear_column(status).map_err(|e| e.to_string())
}

// Settings commands
#[tauri::command]
fn get_settings(state: State<AppState>) -> Result<Settings, String> {
    let db = state.db.lock().unwrap();
    db.get_settings().map_err(|e| e.to_string())
}

#[tauri::command]
fn update_settings(settings: Settings, state: State<AppState>) -> Result<(), String> {
    let db = state.db.lock().unwrap();
    db.update_settings(settings).map_err(|e| e.to_string())
}

// Calendar preset commands
#[tauri::command]
fn get_all_presets(state: State<AppState>) -> Result<Vec<CalendarPreset>, String> {
    let db = state.db.lock().unwrap();
    db.get_all_presets().map_err(|e| e.to_string())
}

#[tauri::command]
fn add_preset(preset: NewCalendarPreset, state: State<AppState>) -> Result<i64, String> {
    let db = state.db.lock().unwrap();
    db.add_preset(preset).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_preset(id: i64, state: State<AppState>) -> Result<(), String> {
    let db = state.db.lock().unwrap();
    db.delete_preset(id).map_err(|e| e.to_string())
}

fn main() {
    // Get AppData directory
    let app_data = tauri::api::path::app_data_dir(&tauri::Config::default())
        .unwrap_or_else(|| std::path::PathBuf::from("."));
    
    std::fs::create_dir_all(&app_data).ok();
    
    let db_path = app_data.join("kalenote.db");
    println!("Database path: {:?}", db_path);
    
    let db = Database::new(db_path.to_str().unwrap())
        .expect("Failed to initialize database");

    tauri::Builder::default()
        .manage(AppState {
            db: Mutex::new(db),
        })
        .invoke_handler(tauri::generate_handler![
            get_all_tasks,
            add_task,
            update_task,
            delete_task,
            clear_column,
            get_settings,
            update_settings,
            get_all_presets,
            add_preset,
            delete_preset,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
