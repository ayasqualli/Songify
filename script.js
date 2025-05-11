import { useRuntimeConfig } from "#imports";

const config = useRuntimeConfig();
const clientId = config.public.spotify_client_id;
const clientSecret = config.private.spotify_secret_id;

const params = new URLSearchParams(window.location.search);
const code = params.get("code");

async function main() {
    try {
        if (!code) {
            await redirectToAuthCodeFlow(clientId);
        } else {
            const accessToken = await getAccessToken(clientId, clientSecret, code);
            const profile = await fetchProfile(accessToken);
            populateUI(profile);
        }
    } catch (error) {
        console.error("Something went wrong:", error);
    }
}

main();

async function redirectToAuthCodeFlow(clientId) {
    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://127.0.0.1:3000/callback");
    params.append("scope", "user-read-private user-read-email");

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function getAccessToken(clientId, clientSecret, code) {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://127.0.0.1:3000/callback");

    const credentials = btoa(`${clientId}:${clientSecret}`);

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${credentials}`
        },
        body: params
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token fetch failed: ${error}`);
    }

    const { access_token } = await response.json();
    return access_token;
}

async function fetchProfile(token) {
    const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Profile fetch failed: ${error}`);
    }

    return await response.json();
}

function populateUI(profile) {
    console.log("Profile data:", profile);
}

// Only export what you need for other modules
export { redirectToAuthCodeFlow, fetchProfile };
