export function decodeJWT(token: string): { exp?: number } | null {
  try {
    const payload = token.split(".")[1]; // Get the payload part of the JWT
    const decoded = JSON.parse(atob(payload)); // Decode Base64 and parse JSON
    return decoded;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}
