import { Auth } from "msmc";
import { getAuthStorage, updateAuth } from "./auth-storage";
import { decodeJWT, getAvatar } from "../utils/auth";

const authManager = new Auth("select_account");

export async function auth(): Promise<{
  profile: {
    name: string;
    id: string;
  };
  accessToken: string;
  avatar?: string | null;
}> {
  const accessToken = getAccessToken();

  if (accessToken) {
    return {
      profile: getAuthStorage().profile,
      accessToken: accessToken,
    };
  }

  // If no access token, launch the auth manager
  const xboxManager = await authManager.launch("electron");

  const token = await xboxManager.getMinecraft();

  if (!token || !token.profile) {
    throw new Error("Failed to get token or profile");
  }

  const avatar = await getAvatar(token.profile.id);

  // Save the token and profile to storage
  const authData = {
    profile: token.profile,
    accessToken: token.mcToken,
    avatar,
  };

  updateAuth(authData);

  return {
    profile: token.profile,
    accessToken: token.mcToken,
    avatar: avatar,
  };
}

const getAccessToken = (): string | null => {
  const acctoken = getAuthStorage().accessToken;
  if (acctoken) {
    const decoded = decodeJWT(acctoken);

    if (decoded && decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      if (decoded.exp > currentTime) {
        // Token is valid
        return acctoken;
      }
    }

    return null;
  }

  return null;
};
