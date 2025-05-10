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


<script>
import { redirectToAuthCodeFlow } from '../script.js';

export default {
  methods: {
    async handleSpotifyLogin() {
      const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
      await redirectToAuthCodeFlow(clientId);
    }
  }
};

</script>
<style scoped>
.spotify-auth {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60%;
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
  margin-top: 2rem;
}

.spotify-auth:hover {
  background-color: #1fdb63;
  transform: scale(1.05);
}

.spotify-auth img {
  width: 24px;
  height: 24px;
  position: absolute;
  left: 25px;
}

.spotify-auth span {
  margin-left: 10px;
}
</style>