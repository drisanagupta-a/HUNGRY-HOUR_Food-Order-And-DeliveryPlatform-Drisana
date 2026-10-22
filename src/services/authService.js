const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

async function requestJson(path, method = "GET", data, refreshOnUnauthorized = false) {
  if (!API_BASE_URL) {
    throw new Error("Set VITE_API_BASE_URL before using authentication.");
  }

  const options = {
    method,
    credentials: "include",
  };

  if (data) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(data);
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (error) {
    throw new Error(
      `Could not reach the backend. Check that it is available and allows this website through CORS. ${
        error instanceof Error ? error.message : ""
      }`.trim(),
    );
  }

  if (response.status === 401 && refreshOnUnauthorized) {
    await requestJson("/api/auth/refresh", "POST");
    return requestJson(path, method, data);
  }

  const responseText = await response.text();
  let responseData = {};

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      throw new Error("The backend returned an unreadable response.");
    }
  }

  if (!response.ok) {
    const backendMessage =
      typeof responseData?.message === "string" ? responseData.message : "";
    throw new Error(
      backendMessage || `The backend returned an error (${response.status}).`,
    );
  }

  return responseData;
}

export function logIn(email, password) {
  return requestJson("/api/auth/login", "POST", { email, password });
}

export function signUp(name, email, password) {
  return requestJson("/api/auth/signup", "POST", { name, email, password });
}

export function requestPasswordReset(email) {
  return requestJson("/api/auth/forgot-password", "POST", { email });
}

export function updatePassword(newPassword) {
  return requestJson("/api/account/password", "PUT", { newPassword }, true);
}

export function getMyProfile() {
  return requestJson("/api/profiles/me", "GET", undefined, true);
}