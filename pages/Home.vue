<template>
  <div class="main-layout" v-if="profile && playlists">
    <aside class="library">
      <div class="logo-container">
        <img src="../assets/small.png" alt="Logo" class="logo" />
      </div>
      <h2>Library</h2>
      <ul>
        <li @click="router.push('/playlists')">Playlists</li>
        <li @click="router.push('/artists')">Artists</li>
        <li @click="router.push('/albums')">Albums</li>
        <li @click="router.push('/tracks')">Tracks</li>
      </ul>
    </aside>

    <main class="content">
      <section class="header-section">
        <NavBar />
        <div class="profile-container" @click="router.push('/profile')">
          <div class="profile-picture" v-if="!profile.images?.[0]?.url">
            {{ profile.display_name?.charAt(0)?.toUpperCase() }}
          </div>
          <img v-else :src="profile.images?.[0]?.url" alt="Profile Image" />
        </div>
      </section>

      <section class="playlists">
        <h1>Your Playlists</h1>
        <ul class="playlist-grid">
          <li
            v-for="playlist in playlists.items.slice(0, 8)"
            :key="playlist.id"
          >
            <img
              :src="playlist.images?.[0]?.url"
              alt="playlist cover"
              width="50"
            />
            {{ playlist.name }}
          </li>
        </ul>
      </section>

      <HorizontalSection
        title="Your Top Artists"
        :items="
          topArtists.map((artist) => ({
            id: artist.id,
            images: artist.images,
            name: artist.name,
          }))
        "
      />

      <HorizontalSection
        title="Your Top Tracks"
        :items="
          topTracks.map((track) => ({
            id: track.id,
            images: track.album.images,
            name: track.name,
            artists: track.artists,
          }))
        "
        @click.prevent="navigateToTrack(track.id)"
      />

      <HorizontalSection
        title="Recently Played"
        :items="
          uniqueRecentlyPlayed.map((track) => ({
            id: track.track.id,
            images: track.track.album.images,
            name: track.track.name,
            artists: track.track.artists,
          }))
        "
        @item-click="playTrack"
      />

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Searching...</span>
      </div>
    </main>
  </div>
  <div v-else>
    <p class="loading">Loading Spotify data...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import HorizontalSection from "../components/HorizontalSection.vue";
const router = useRouter();
const route = useRoute();
const profile = ref(null);
const playlists = ref(null);
const topArtists = ref([]);
const topTracks = ref([]);
const recentlyPlayed = ref([]);
const trackId = route.params.id;
const track = ref(null);

const navigateToAlbum = (albumId) => {
  router.push(`/album/${albumId}`);
};

const navigateToTrack = (trackId) => {
  router.push(`/track/${trackId}`);
};

const navigateToArtist = (artistId) => {
  router.push(`/artist/${artistId}`);
};

const uniqueRecentlyPlayed = computed(() => {
  const uniqueTracks = new Map();
  recentlyPlayed.value.forEach((track) => {
    if (!uniqueTracks.has(track.track.id)) {
      uniqueTracks.set(track.track.id, track);
    }
  });
  return Array.from(uniqueTracks.values());
});

const getArtistImage = (artist) => {
  return artist.images?.[0]?.url || "/default-artist.png";
};

const getTrackImage = (track) => {
  return track.album?.images?.[2]?.url || "/default-track.png";
};

const getAlbumImage = (album) => {
  return album.images?.[0]?.url || "/default-album.png";
};

const getPlaylistImage = (playlist) => {
  return playlist.images?.[0]?.url || "../assets/default-playlist.png";
};

const getArtistNames = (artists) => {
  if (!artists?.length) return "Unknown Artist";
  return artists.map((artist) => artist.name).join(", ");
};


const getAlbumArtist = (album) => {
  if (!album.artists?.length) return "Unknown Artist";
  return album.artists[0].name;
};

const getPlaylistOwner = (playlist) => {
  if (!playlist.owner?.display_name) return "Unknown Owner";
  return playlist.owner.display_name;
};

onMounted(async () => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.error("Token manquant. Redirection vers /Home");
    window.location.href = "/Home";
    return;
  }

  try {
    // Fetch profile
    const resProfile = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resProfile.ok) {
      throw new Error(`Failed to fetch profile: ${resProfile.statusText}`);
    }

    profile.value = await resProfile.json();

    // Fetch playlists
    const resPlaylists = await fetch(
      "https://api.spotify.com/v1/me/playlists",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!resPlaylists.ok) {
      throw new Error(`Failed to fetch playlists: ${resPlaylists.statusText}`);
    }

    playlists.value = (await resPlaylists.json()) || [];

    // Fetch top artists
    const resTopArtists = await fetch(
      "https://api.spotify.com/v1/me/top/artists",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!resTopArtists.ok) {
      throw new Error(
        `Failed to fetch top artists: ${resTopArtists.statusText}`
      );
    }

    topArtists.value = (await resTopArtists.json()).items;

    // Fetch top tracks
    const resTopTracks = await fetch(
      "https://api.spotify.com/v1/me/top/tracks",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!resTopTracks.ok) {
      throw new Error(`Failed to fetch top tracks: ${resTopTracks.statusText}`);
    }

    topTracks.value = (await resTopTracks.json()).items;

    // Fetch recently played tracks
    const resRecentlyPlayed = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!resRecentlyPlayed.ok) {
      throw new Error(
        `Failed to fetch recently played tracks: ${resRecentlyPlayed.statusText}`
      );
    }

    recentlyPlayed.value = (await resRecentlyPlayed.json()).items;

    // Fetch track details
    const trackResponse = await fetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!trackResponse.ok) {
      throw new Error("Failed to fetch track");
    }

    track.value = await trackResponse.json();
  } catch (err) {
    console.error("Erreur Spotify:", err);
    playlists.value = [];
  }
});

// Logout function
const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("spotify_profile");
  router.push("/");
};

const handleSearch = () => {
  triggerSearch();
};
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  background-color: #000;
}

.library {
  width: 240px;
  padding: 24px;
  background-color: #000;
  color: #b3b3b3;
}

.logo-container {
  margin-bottom: 24px;
}

.logo {
  width: 80px;
  height: auto;
}

.library h2 {
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 24px;
}

.library ul {
  list-style: none;
  padding: 0;
}

.library li {
  color: #b3b3b3;
  padding: 8px 0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.library li:hover {
  color: #fff;
}

.content {
  flex: 1;
  padding: 24px;
  background: linear-gradient(#1f1f1f, #121212);
  overflow-y: auto;
}

.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 400px;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #b3b3b3;
}

.search-input {
  background-color: #393939;
  border-radius: 24px;
  border: none;
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
  color: #b3b3b3;
}

.search-button {
  background-color: #393939;
  border: none;
  border-radius: 50%;
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.search-button:hover {
  background-color: #3a3a3a;
}

.search-button svg {
  width: 20px;
  height: 20px;
  stroke: #b3b3b3;
  transition: stroke 0.2s ease;
}

.search-button:hover svg {
  stroke: #fff;
}

.clear-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #b3b3b3;
  cursor: pointer;
}

.profile-container {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #2c2d2b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.profile-container:hover {
  transform: scale(1.1);
}

.profile-picture {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  background-color: #1db954;
  color: #000;
  font-size: 18px;
  font-weight: bold;
}

.playlists {
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(to bottom, #31285c, #121212);
  margin-bottom: 32px;
}

.playlists h1 {
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.playlists li {
  display: flex;
  align-items: center;
  background-color: rgb(65, 65, 65, 0.3);
  padding: 16px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.playlists li:hover {
  background-color: rgb(65, 65, 65, 0.6);
}

.playlists img {
  width: 50px;
  height: 50px;
  margin-right: 16px;
  border-radius: 4px;
}

.playlists li span {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.loading {
  color: #b3b3b3;
  font-style: italic;
  text-align: center;
  margin-top: 40px;
}

.horizontal-section {
  margin-bottom: 32px;
}

.section-title {
  color: #fff;
  margin-bottom: 16px;
  font-size: 1.5rem;
  color: #ffffff;
}

.scroll-list {
  display: flex;
  flex-direction: row;
  gap: 16px;
  list-style: none;
  padding: 0;
  margin: 0;
  scroll-behavior: smooth;
}

.scroll-item {
  min-width: 160px;
  max-width: 160px;
  background-color: #1e1e1e;
  border-radius: 12px;
  padding: 12px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  cursor: pointer;
}

.scroll-item:hover {
  transform: scale(1.05);
  background-color: #282828;
}

.item-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 8px;
}

.item-details {
  color: #ffffff;
  text-align: left;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-sub {
  font-size: 0.875rem;
  color: #b3b3b3;
  margin: 4px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loading {
  color: #b3b3b3;
  font-style: italic;
}

button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #ff1a1a;
}

.horizontal-section {
  background-color: #000;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 10px;
}

.section-title {
  font-size: 24px;
  margin-bottom: 15px;
  color: #fff;
}

.scroll-list {
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding: 10px 0;
  list-style: none;
  scroll-behavior: smooth;
}

.scroll-item {
  flex: 0 0 auto;
  width: 160px;
  color: #fff;
  text-align: center;
}

.item-image {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.item-sub {
  font-size: 12px;
  color: #b3b3b3;
}

.loading {
  color: #888;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid #fff;
  border-top: 4px solid #1db954;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
