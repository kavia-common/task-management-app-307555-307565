import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { createTask, deleteTask, listTasks, updateTask } from './api/tasks';

const EMPTY_FORM = { title: '', description: '', completed: false };

// PUBLIC_INTERFACE
function App() {
  /** Main application UI for managing tasks. */
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const isEditing = useMemo(() => editingId !== null, [editingId]);

  async function refresh() {
    setLoading(true);
    setGlobalError('');
    try {
      const data = await listTasks();
      setTasks(data);
    } catch (e) {
      setGlobalError(e?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Lock to light theme per request.
    document.documentElement.setAttribute('data-theme', 'light');
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setGlobalError('');
  }

  function startEdit(task) {
    setEditingId(task.id);
    setForm({ title: task.title, description: task.description || '', completed: !!task.completed });
    setGlobalError('');
  }

  async function onSubmit(e) {
    e.preventDefault();
    setGlobalError('');

    const payload = {
      title: form.title.trim(),
      description: (form.description || '').trim(),
      completed: !!form.completed,
    };

    if (!payload.title) {
      setGlobalError('Title is required.');
      return;
    }

    try {
      if (isEditing) {
        await updateTask(editingId, payload);
      } else {
        await createTask(payload);
      }
      startCreate();
      await refresh();
    } catch (err) {
      setGlobalError(err?.message || 'Save failed');
    }
  }

  async function toggleCompleted(task) {
    setGlobalError('');
    try {
      await updateTask(task.id, { completed: !task.completed });
      await refresh();
    } catch (err) {
      setGlobalError(err?.message || 'Update failed');
    }
  }

  async function remove(task) {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(`Delete "${task.title}"?`);
    if (!ok) return;

    setGlobalError('');
    try {
      await deleteTask(task.id);
      if (editingId === task.id) startCreate();
      await refresh();
    } catch (err) {
      setGlobalError(err?.message || 'Delete failed');
    }
  }

  return (
    <div className="App">
      <header className="tm-header">
        <div className="tm-header__inner">
          <div>
            <h1 className="tm-title">Tasks</h1>
            <p className="tm-subtitle">Add, edit, complete, and delete your to-dos.</p>
          </div>
          <div className="tm-pill" aria-label="Backend connection info">
            Backend: <span className="tm-mono">http://localhost:3001</span>
          </div>
        </div>
      </header>

      <main className="tm-container">
        {globalError ? (
          <div className="tm-alert" role="alert">
            {globalError}
          </div>
        ) : null}

        <section className="tm-grid" aria-label="Task manager">
          <div className="tm-card">
            <div className="tm-card__header">
              <h2 className="tm-card__title">{isEditing ? 'Edit task' : 'Add a task'}</h2>
              {isEditing ? (
                <button type="button" className="tm-btn tm-btn--ghost" onClick={startCreate}>
                  Cancel
                </button>
              ) : null}
            </div>

            <form className="tm-form" onSubmit={onSubmit}>
              <label className="tm-field">
                <span className="tm-label">Title</span>
                <input
                  className="tm-input"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Buy groceries"
                  maxLength={120}
                  required
                />
              </label>

              <label className="tm-field">
                <span className="tm-label">Description</span>
                <textarea
                  className="tm-textarea"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Optional details..."
                  rows={4}
                  maxLength={2000}
                />
              </label>

              <label className="tm-check">
                <input
                  type="checkbox"
                  checked={form.completed}
                  onChange={(e) => setForm((p) => ({ ...p, completed: e.target.checked }))}
                />
                <span>Completed</span>
              </label>

              <div className="tm-actions">
                <button type="submit" className="tm-btn tm-btn--primary">
                  {isEditing ? 'Save changes' : 'Add task'}
                </button>
                {isEditing ? (
                  <button type="button" className="tm-btn" onClick={() => remove(tasks.find((t) => t.id === editingId))}>
                    Delete
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="tm-card">
            <div className="tm-card__header">
              <h2 className="tm-card__title">Your tasks</h2>
              <button type="button" className="tm-btn tm-btn--ghost" onClick={refresh} disabled={loading}>
                Refresh
              </button>
            </div>

            {loading ? <div className="tm-muted">Loading…</div> : null}

            {!loading && tasks.length === 0 ? (
              <div className="tm-empty">
                <div className="tm-empty__title">No tasks yet</div>
                <div className="tm-empty__subtitle">Add your first task using the form.</div>
              </div>
            ) : null}

            <ul className="tm-list" aria-label="Task list">
              {tasks.map((t) => (
                <li key={t.id} className="tm-item">
                  <button
                    type="button"
                    className={`tm-checkbtn ${t.completed ? 'is-checked' : ''}`}
                    onClick={() => toggleCompleted(t)}
                    aria-label={t.completed ? 'Mark as not completed' : 'Mark as completed'}
                    title={t.completed ? 'Mark as not completed' : 'Mark as completed'}
                  >
                    <span className="tm-checkbtn__dot" />
                  </button>

                  <div className="tm-item__content">
                    <div className="tm-item__row">
                      <div className={`tm-item__title ${t.completed ? 'is-done' : ''}`}>{t.title}</div>
                      <div className="tm-item__meta">#{t.id}</div>
                    </div>
                    {t.description ? <div className="tm-item__desc">{t.description}</div> : null}
                  </div>

                  <div className="tm-item__actions">
                    <button type="button" className="tm-btn tm-btn--ghost" onClick={() => startEdit(t)}>
                      Edit
                    </button>
                    <button type="button" className="tm-btn tm-btn--danger" onClick={() => remove(t)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="tm-footer">
          <span className="tm-muted">
            Tip: Click the circle to toggle completion. Backend data is stored in-memory (resets on server restart).
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
