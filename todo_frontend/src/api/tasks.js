const API_BASE_URL = 'http://localhost:3001';

/**
 * Parse JSON responses, raising a readable error when possible.
 */
async function parseJsonResponse(response) {
  if (response.status === 204) return null;

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const detail = data && (data.detail || data.message) ? (data.detail || data.message) : response.statusText;
    throw new Error(detail || 'Request failed');
  }
  return data;
}

// PUBLIC_INTERFACE
export async function listTasks() {
  /** Fetch all tasks. */
  const res = await fetch(`${API_BASE_URL}/tasks`);
  return parseJsonResponse(res);
}

// PUBLIC_INTERFACE
export async function createTask(payload) {
  /** Create a new task. */
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(res);
}

// PUBLIC_INTERFACE
export async function updateTask(taskId, payload) {
  /** Update an existing task by id (partial update). */
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(res);
}

// PUBLIC_INTERFACE
export async function deleteTask(taskId) {
  /** Delete a task by id. */
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, { method: 'DELETE' });
  return parseJsonResponse(res);
}
