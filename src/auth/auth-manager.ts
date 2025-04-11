import { Auth } from "msmc";
import { getAuthStorage, updateAuth } from "./auth-storage";

const authManager = new Auth("select_account");

export async function auth(): Promise<{
  profile: {
    name: string;
    id: string;
  };
  accessToken: string;
}> {
  // Auth manager logic here
  const acctoken = getAuthStorage().accessToken;

  if (acctoken) {
    // TODO: Check if the token is valid

    return {
      profile: getAuthStorage().profile,
      accessToken: acctoken,
    };
  } else {
    const xboxManager = await authManager.launch("electron");

    const token = await xboxManager.getMinecraft();

    if (!token || !token.profile) {
      throw new Error("Failed to get token or profile");
    }

    // Save the token and profile to storage
    const authData = {
      profile: token.profile,
      accessToken: token.mcToken,
    };

    updateAuth(authData);

    return {
      profile: token.profile,
      accessToken: token.mcToken,
    };
  }
}

export function isTokenValid() {
  const accessToken = getAuthStorage().accessToken;
  if (!accessToken) {
    return false;
  }

  return accessToken;
}
