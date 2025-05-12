<template>
    <div class="page-container">
        <button class="home-button" @click="goHome">
      <Icon name="ph:house" size="40" />
    </button>
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
        <button class="logout-button" @click="logout">
          <span>Logout</span>
          <Icon name="material-symbols:logout" size="20" />
        </button>
      </div>

      <div class="profile-details">
        <h2>Public Playlists</h2>
        <div class="playlists-grid">
          <div 
            v-for="playlist in publicPlaylists" 
            :key="playlist.id" 
            class="playlist-card"
            @click="router.push(`/playlist/${playlist.id}`)"
          >
            <div class="playlist-image">
              <img 
                v-if="playlist.images?.[0]?.url" 
                :src="playlist.images[0].url" 
                alt="Playlist Cover"
              >
              <div v-else class="default-image">
                <Icon name="ph:music-notes" size="32" />
              </div>
            </div>
            <div class="playlist-info">
              <h3>{{ playlist.name }}</h3>
              <p>{{ playlist.tracks.total }} tracks</p>
            </div>
          </div>
        </div>
      </div>

    </section>
  </div>
  <div v-else class="loading-container">
    <p class="loading-text">Chargement des données Spotify...</p>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const profile = ref(null);
const publicPlaylists = ref([]);
const publicPlaylistsCount = ref(0);

onMounted(async () => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.error("Token manquant. Redirection vers /Home");
    window.location.href = "/Home";
    return;
  }

  try {
    const [resProfile, resPlaylists] = await Promise.all([
      fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("https://api.spotify.com/v1/me/playlists?", {
        headers: { Authorization: `Bearer ${token}` },
      })
    ]);

    if (!resProfile.ok) throw new Error(`Failed to fetch profile: ${resProfile.statusText}`);
    if (!resPlaylists.ok) throw new Error(`Failed to fetch playlists: ${resPlaylists.statusText}`);

    profile.value = await resProfile.json();
    const playlistsData = await resPlaylists.json();
    publicPlaylists.value = playlistsData.items.filter(playlist => playlist.public);
    publicPlaylistsCount.value = publicPlaylists.value.length;
  } catch (err) {
    console.error("Erreur Spotify:", err);
  }
});

const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("spotify_profile");
  router.push("/");
};

const goHome = () => {
    router.push('/Home');
};
</script>

<style scoped>

.page-container{
    padding : 16px;
}
.profile-section {
  padding: 8px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(to bottom, #555555, #282828);
  border-radius: 12px 12px 0 0;
  position: relative;
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
  flex: 1;
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
  border-radius: 0 0 12px 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.profile-details h2 {
  color: #fff;
  margin-bottom: 1.5rem;
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.playlist-card {
  background: #383838;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.playlist-card:hover {
  transform: translateY(-4px);
}

.playlist-image {
  width: 100%;
  aspect-ratio: 1;
  background: #282828;
}

.playlist-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b3b3b3;
}

.playlist-info {
  padding: 1rem;
}

.playlist-info h3 {
  color: #fff;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.playlist-info p {
  color: #b3b3b3;
  font-size: 0.875rem;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #fffafa;
  padding: 0.5rem;
  cursor: pointer;
  transition: color 0.2s ease;
  margin-bottom: auto;
}

.logout-button:hover {
  color: #fff;
}

.loading-container {
  text-align: center;
  padding: 4rem;
}

.loading-text {
  color: #b3b3b3;
  font-size: 1.2rem;
}

.home-button {
  padding: 8px;
  margin-left: 10px;
  margin-bottom: 10px;
  background: transparent;
  color: white;
  border: none;
  height: 50px;
  width: 50px;
  display: flex;
  align-items:center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
  z-index: 100;
}
</style>
