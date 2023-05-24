export function jsonRequest(method: RequestInit["method"], data: Record<string, any> = {}) {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
}
