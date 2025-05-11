<template>
  <div v-if="profile" class="profile-page">
    <section class="profile-section">
      <div class="profile-header">
        <div class="profile-image-container">
          <div class="profile-picture" v-if="!profile.images?.[0]?.url">
            {{ profile.display_name?.charAt(0)?.toUpperCase() }}
          </div>
          <img
            v-else
            :src="profile.images?.[0]?.url"
            alt="Profile Image"
            class="profile-image"
          />
        </div>
        <div class="profile-name">
          <p>Profile</p>
          <h1>{{ profile.display_name }}</h1>
          <p>{{ publicPlaylistsCount }} Public Playlists - {{ profile.followers?.total }} Followers</p>
        </div>
      </div>

      <div class="profile-details">
      </div>

      <button class="logout-button" @click="logout">Déconnexion</button>
    </section>
  </div>
  <div v-else class="loading-container">
    <p class="loading-text">Chargement des données Spotify...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const profile = ref(null);

onMounted(async () => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.error("Token manquant. Redirection vers /Home");
    window.location.href = "/Home";
    return;
  }

  try {
    const resProfile = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resProfile.ok) {
      throw new Error(`Failed to fetch profile: ${resProfile.statusText}`);
    }

    profile.value = await resProfile.json();
  } catch (err) {
    console.error("Erreur Spotify:", err);
  }
});

const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("spotify_profile");
  router.push("/");
};
</script>

<style scoped>
.profile-section {
  padding: 8px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(to bottom, #555555, #2c2c2c);
  border-radius: 12px;
  margin-bottom: 2rem;
}

.profile-image-container {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  background: #282828;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-image,
.profile-picture {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-picture {
  font-size: 64px;
  color: #555555;
  display:flex;
  align-items: center;
  justify-content: center;
  background: #282828;
}

.profile-name {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-name p:first-child {
  color: #b3b3b3;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.profile-name h1 {
  font-size: 90px;
  font-weight: 750;
  color: #fff;
  margin: 0;
}

.profile-name p:last-child {
  color: #b3b3b3;
  font-size: 0.9rem;
}

.profile-details {
  background: #282828;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #444;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #b3b3b3;
  font-weight: 500;
}

.detail-value {
  color: #fff;
  font-weight: 400;
}

.logout-button {
  width: fit-content;
  padding: 1rem;
  background-color: #ff4d4d;
  color: white;
  border: none;
  text-align: center; 
  font-size: 15px;
  font-weight: 600;
  border-radius: 16px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background-color: #ff1a1a;
}

.loading-container {
  text-align: center;
  padding: 4rem;
}

.loading-text {
  color: #b3b3b3;
  font-size: 1.2rem;
}
</style>
