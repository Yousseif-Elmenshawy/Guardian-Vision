const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8081/api").replace(/\/$/, "");

const TOKEN_KEY = "gv_token";
const STUDENT_KEY = "gv_student";

async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = "حدث خطأ أثناء الاتصال بالخادم";
    try {
      const payload = await response.json();
      message = payload.message || payload.error || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveSession(payload) {
  localStorage.setItem(TOKEN_KEY, payload.token);
  localStorage.setItem(STUDENT_KEY, JSON.stringify(payload.student));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(STUDENT_KEY);
}

export function getSavedStudent() {
  const value = localStorage.getItem(STUDENT_KEY);
  return value ? JSON.parse(value) : null;
}

export function login({ nationalID, password, majorCode }) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: {
      national_id: nationalID,
      password,
      ...(majorCode ? { major_code: majorCode } : {}),
    },
  });
}

export function getCurrentStudent() {
  return apiRequest("/students/me");
}

export function getStudentPerformance() {
  return apiRequest("/students/me/performance");
}

export function getStudentSubjects(monthID) {
  const query = monthID ? `?month_id=${monthID}` : "";
  return apiRequest(`/students/me/subjects${query}`);
}

export function getGrades() {
  return apiRequest("/grades");
}

export function getUniformProducts() {
  return apiRequest("/uniform/products");
}

export function getUniformSizes() {
  return apiRequest("/uniform/sizes");
}

export function createUniformOrder(order) {
  return apiRequest("/uniform/orders", {
    method: "POST",
    body: order,
  });
}

/**
 * Validates a national ID against the database before allowing registration.
 * Call this FIRST before showing the full uniform order form.
 *
 * @param {string} nationalID - 14-digit national ID
 * @returns {Promise<{success: boolean, message: string, student_id?: number, full_name?: string, grade_id?: number, grade_name?: string, major_code?: string, major_name?: string}>}
 */
export function validateNationalID(nationalID) {
  return apiRequest("/registration/validate-national-id", {
    method: "POST",
    body: { national_id: nationalID },
  });
}