import axios from "axios";
console.log(import.meta.env);
const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000/api"
      : "/api",
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor to handle 401 (expired/invalid token) globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear stale session data
      localStorage.removeItem("user");
      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// De-duplicate identical GET requests that are already in-flight (e.g. two
// mount effects firing back-to-back under React.StrictMode in dev, or a
// re-render kicking off the same fetch again before the first one settles).
// Concurrent callers for the same URL/params share one network request and
// all resolve with the same response; a call made after the previous one
// has settled still triggers a fresh request as normal.
const pendingGetRequests = new Map();
const originalGet = api.get.bind(api);

api.get = (url, config) => {
  let key;
  try {
    key = `${url}::${JSON.stringify(config?.params || {})}`;
  } catch {
    key = url;
  }

  if (pendingGetRequests.has(key)) {
    return pendingGetRequests.get(key);
  }

  const request = originalGet(url, config).finally(() => {
    pendingGetRequests.delete(key);
  });

  pendingGetRequests.set(key, request);
  return request;
};

export default api;
