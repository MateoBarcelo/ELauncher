export const decodeJWT = (token: string): { exp?: number } | null => {
  try {
    const payload = token.split(".")[1]; // Get the payload part of the JWT
    const decoded = JSON.parse(atob(payload)); // Decode Base64 and parse JSON
    return decoded;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

export const getAvatar = async (uuid: string): Promise<string | null> => {
  const response = await fetch(process.env.AVATAR_URL + uuid);

  if (!response.ok) {
    console.error("Failed to fetch avatar:", response.statusText);
    return null;
  }

  const buffer = await response.arrayBuffer();
  const base64String = Buffer.from(buffer).toString("base64");
  return `data:image/png;base64,${base64String}`;
};
