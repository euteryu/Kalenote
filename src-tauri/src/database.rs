use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: i64,
    pub content: String,
    pub status: String,
    pub priority: i32,
    pub created_at: String,
    pub completed_at: Option<String>,
    pub due_date: Option<String>,
    pub time_duration: Option<i32>,
    pub tags: String, // JSON array as string
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewTask {
    pub content: String,
    pub status: String,
    pub priority: i32,
    pub tags: String,
    pub time_duration: Option<i32>,
    pub due_date: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    pub theme: String,
    pub time_mode: String,
    pub available_time: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CalendarPreset {
    pub id: i64,
    pub name: String,
    pub default_tags: String, // JSON array as string
    pub default_priority: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewCalendarPreset {
    pub name: String,
    pub default_tags: String,
    pub default_priority: i32,
}

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn new(path: &str) -> Result<Self> {
        let conn = Connection::open(path)?;
        
        // Tasks table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('inbox', 'todo', 'doing', 'done')),
                priority INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                completed_at TEXT,
                due_date TEXT,
                time_duration INTEGER,
                tags TEXT NOT NULL DEFAULT '[]'
            )",
            [],
        )?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_status ON tasks(status)",
            [],
        )?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_due_date ON tasks(due_date)",
            [],
        )?;

        // Settings table (single row)
        conn.execute(
            "CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                theme TEXT NOT NULL DEFAULT 'cool-blues',
                time_mode TEXT NOT NULL DEFAULT 'daily',
                available_time INTEGER NOT NULL DEFAULT 12
            )",
            [],
        )?;

        // Initialize default settings if not exists
        conn.execute(
            "INSERT OR IGNORE INTO settings (id, theme, time_mode, available_time) 
             VALUES (1, 'cool-blues', 'daily', 12)",
            [],
        )?;

        // Calendar presets table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS calendar_presets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                default_tags TEXT NOT NULL DEFAULT '[]',
                default_priority INTEGER NOT NULL DEFAULT 0
            )",
            [],
        )?;

        Ok(Database {
            conn: Mutex::new(conn),
        })
    }

    // Task methods
    pub fn get_all_tasks(&self) -> Result<Vec<Task>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, content, status, priority, created_at, completed_at, due_date, time_duration, tags 
             FROM tasks ORDER BY created_at DESC"
        )?;

        let tasks = stmt.query_map([], |row| {
            Ok(Task {
                id: row.get(0)?,
                content: row.get(1)?,
                status: row.get(2)?,
                priority: row.get(3)?,
                created_at: row.get(4)?,
                completed_at: row.get(5)?,
                due_date: row.get(6)?,
                time_duration: row.get(7)?,
                tags: row.get(8)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;

        Ok(tasks)
    }

    pub fn add_task(&self, task: NewTask) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO tasks (content, status, priority, tags, time_duration, due_date) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                task.content,
                task.status,
                task.priority,
                task.tags,
                task.time_duration,
                task.due_date,
            ],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn update_task(
        &self,
        id: i64,
        content: Option<String>,
        status: Option<String>,
        priority: Option<i32>,
        tags: Option<String>,
        time_duration: Option<i32>,
        due_date: Option<String>,
        completed_at: Option<String>,
    ) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        
        let mut updates = Vec::new();
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

        if let Some(c) = content {
            updates.push("content = ?");
            params.push(Box::new(c));
        }
        if let Some(s) = status {
            updates.push("status = ?");
            params.push(Box::new(s));
        }
        if let Some(p) = priority {
            updates.push("priority = ?");
            params.push(Box::new(p));
        }
        if let Some(t) = tags {
            updates.push("tags = ?");
            params.push(Box::new(t));
        }
        if let Some(td) = time_duration {
            updates.push("time_duration = ?");
            params.push(Box::new(td));
        }
        if let Some(dd) = due_date {
            updates.push("due_date = ?");
            params.push(Box::new(dd));
        }
        if let Some(ca) = completed_at {
            updates.push("completed_at = ?");
            params.push(Box::new(ca));
        }

        if updates.is_empty() {
            return Ok(());
        }

        params.push(Box::new(id));

        let query = format!("UPDATE tasks SET {} WHERE id = ?", updates.join(", "));
        
        let param_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();
        
        conn.execute(&query, param_refs.as_slice())?;
        Ok(())
    }

    pub fn delete_task(&self, id: i64) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM tasks WHERE id = ?", params![id])?;
        Ok(())
    }

    pub fn clear_column(&self, status: String) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM tasks WHERE status = ?", params![status])?;
        Ok(())
    }

    // Settings methods
    pub fn get_settings(&self) -> Result<Settings> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT theme, time_mode, available_time FROM settings WHERE id = 1")?;
        
        let settings = stmt.query_row([], |row| {
            Ok(Settings {
                theme: row.get(0)?,
                time_mode: row.get(1)?,
                available_time: row.get(2)?,
            })
        })?;

        Ok(settings)
    }

    pub fn update_settings(&self, settings: Settings) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE settings SET theme = ?1, time_mode = ?2, available_time = ?3 WHERE id = 1",
            params![settings.theme, settings.time_mode, settings.available_time],
        )?;
        Ok(())
    }

    // Calendar preset methods
    pub fn get_all_presets(&self) -> Result<Vec<CalendarPreset>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, name, default_tags, default_priority FROM calendar_presets ORDER BY name"
        )?;

        let presets = stmt.query_map([], |row| {
            Ok(CalendarPreset {
                id: row.get(0)?,
                name: row.get(1)?,
                default_tags: row.get(2)?,
                default_priority: row.get(3)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;

        Ok(presets)
    }

    pub fn add_preset(&self, preset: NewCalendarPreset) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO calendar_presets (name, default_tags, default_priority) VALUES (?1, ?2, ?3)",
            params![preset.name, preset.default_tags, preset.default_priority],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn delete_preset(&self, id: i64) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM calendar_presets WHERE id = ?", params![id])?;
        Ok(())
    }
}
