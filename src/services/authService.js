const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function requestJson(
  path,
  method = "GET",
  data,
  refreshOnUnauthorized = false,
  timeoutMs = 0,
  deadlineAt = null,
) {
  if (!API_BASE_URL) {
    throw new Error("Set VITE_API_BASE_URL before using authentication.");
  }

  const requestDeadline =
    deadlineAt ?? (timeoutMs > 0 ? Date.now() + timeoutMs : null);
  const remainingMs = requestDeadline ? requestDeadline - Date.now() : 0;

  if (requestDeadline && remainingMs <= 0) {
    throw new Error("The backend took too long to respond. Please try again.");
  }

  const controller = requestDeadline ? new AbortController() : null;
  let requestTimedOut = false;
  const timeoutId = controller
    ? setTimeout(() => {
        requestTimedOut = true;
        controller.abort();
      }, remainingMs)
    : null;

  const options = {
    method,
    credentials: "include",
  };

  if (controller) {
    options.signal = controller.signal;
  }

  if (data) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(data);
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (requestTimedOut) {
      throw new Error("The backend took too long to respond. Please try again.");
    }
    throw new Error(
      `Could not reach the backend. Check that it is available and allows this website through CORS. ${
        error instanceof Error ? error.message : ""
      }`.trim(),
    );
  }

  if (response.status === 401 && refreshOnUnauthorized) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    await requestJson(
      "/api/auth/refresh",
      "POST",
      undefined,
      false,
      timeoutMs,
      requestDeadline,
    );
    return requestJson(
      path,
      method,
      data,
      false,
      timeoutMs,
      requestDeadline,
    );
  }

  let responseText;
  try {
    responseText = await response.text();
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (requestTimedOut) {
      throw new Error("The backend took too long to respond. Please try again.");
    }
    throw error;
  }
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

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
    throw new ApiError(
      backendMessage || `The backend returned an error (${response.status}).`,
      response.status,
    );
  }

  return responseData;
}

export function logIn(email, password) {
  return requestJson("/api/auth/login", "POST", { email, password });
}

export function logOut() {
  return requestJson("/api/auth/logout", "POST");
}

export function signUp(name, email, password) {
  return requestJson("/api/auth/signup", "POST", { name, email, password });
}

export function verifyOtp(email, token) {
  return requestJson("/api/auth/verify-otp", "POST", { email, token });
}

export function resendOtp(email) {
  return requestJson("/api/auth/resend-otp", "POST", { email });
}

export function requestPasswordReset(email) {
  return requestJson("/api/auth/forgot-password", "POST", { email });
}

export function updatePassword(newPassword) {
  return requestJson("/api/account/password", "PUT", { newPassword }, true);
}

const PUBLIC_HEALTH_PATH = import.meta.env.VITE_PUBLIC_HEALTH_PATH?.trim();
export const hasConfiguredPublicHealthPath = Boolean(PUBLIC_HEALTH_PATH);

export function checkConfiguredPublicEndpoint(timeoutMs = 12_000) {
  if (!API_BASE_URL || !PUBLIC_HEALTH_PATH) {
    return null;
  }

  const healthPath = `/${PUBLIC_HEALTH_PATH.split("/").filter(Boolean).join("/")}`;
  let healthUrl;

  try {
    healthUrl = new URL(healthPath, API_BASE_URL);
  } catch (error) {
    return Promise.reject(
      new Error(
        `Could not construct the configured public backend URL. ${
          error instanceof Error ? error.message : ""
        }`.trim(),
      ),
    );
  }

  const controller = new AbortController();
  let requestTimedOut = false;
  const timeoutId = setTimeout(() => {
    requestTimedOut = true;
    controller.abort();
  }, timeoutMs);

  return fetch(healthUrl, {
    method: "GET",
    credentials: "omit",
    signal: controller.signal,
  })
    .then((response) => {
      if (!response.ok) {
        throw new ApiError(
          `The public backend check returned an error (${response.status}).`,
          response.status,
        );
      }
    })
    .catch((error) => {
      if (requestTimedOut) {
        throw new Error("The public backend check timed out.");
      }
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(
        `Could not reach the configured public backend endpoint. ${
          error instanceof Error ? error.message : ""
        }`.trim(),
      );
    })
    .finally(() => clearTimeout(timeoutId));
}

export function getMyProfile() {
  return requestJson("/api/profiles/me", "GET", undefined, true, 120_000);
}