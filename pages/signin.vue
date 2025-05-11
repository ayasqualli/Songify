<template>
  <div class="cont">
    <div class="form-container">
      <div class="title">
        <img src="../assets/logo.png" alt="logo" />
        <h1>Connectez-vous avec Spotify</h1>
      </div>
      <button @click="handleSpotifyLogin" class="spotify-auth">
        <img src="../assets/small.png" alt="Logo" />
        <span>Continuer avec Spotify</span>
      </button>
      <div class="signup">
        <span>Pas encore inscrit ?</span>
        <a class="link" href="https://www.spotify.com/signup" target="_blank">Créer un compte Spotify</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRuntimeConfig, ref, onMounted } from "#imports";

const config = useRuntimeConfig();
const clientId = config.public.spotify_client_id;
const clientSecret = config.public.spotify_secret_id;

const code = ref(null);

onMounted(() => {
  if (process.client) {
    const params = new URLSearchParams(window.location.search);
    code.value = params.get("code");
  }
});

const handleSpotifyLogin = async () => {
  try {
    if (!code.value) {
      await redirectToAuthCodeFlow(clientId);
    } else {
      const accessToken = await getAccessToken(clientId, clientSecret, code.value);
      const profile = await fetchProfile(accessToken);
      populateUI(profile);
    }
  } catch (error) {
    console.error("Something went wrong:", error);
  }
};

async function redirectToAuthCodeFlow(clientId) {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "http://127.0.0.1:3000/callback");
  params.append("scope", "user-read-private user-read-email user-library-read playlist-read-private playlist-read-collaborative user-top-read user-read-recently-played user-follow-read user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-playback-position user-read-recently-played user-read-playback-state user-modify-playback-state user-library-modify user-library-read user-read-currently-playing user-read-playback-position user-read-recently-played user-top-read user-read-playback-state user-modify-playback-state user-library-modify user-library-read user-read-currently-playing user-read-playback-position user-read-recently-played user-top-read");

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function getAccessToken(clientId, clientSecret, code) {
  const response = await $fetch('/api/spotify/token', {
    method: 'POST',
    body: {
      code,
    },
  });

  if (!response.access_token) {
    throw new Error('Failed to fetch access token');
  }

  return response.access_token;
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
</script>

<style scoped>
.cont {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.form-container {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.title img {
  width: 100px;
  margin-bottom: 1rem;
}

.title h1 {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.spotify-auth {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  border-radius: 24px;
  background-color: #1ed760;
  color: black;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s;
  position: relative;
  margin: auto;
  margin-top: 1rem;
  border: none;
}

.spotify-auth:hover {
  background-color: #1fdb63;
  transform: scale(1.05);
  color: black;
}

.spotify-auth img {
  width: 24px;
  height: 24px;
  position: absolute;
  left: 25px;
}

.spotify-auth span {
  margin-left: 10px;
  color: black;
}

.signup {
  margin-top: 1.5rem;
  font-size: 0.9rem;
}

.link {
  color: #1ed760;
  text-decoration: none;
  font-weight: 600;
  margin-left: 10px;
}

.link:hover {
  text-decoration: underline;
}
</style>