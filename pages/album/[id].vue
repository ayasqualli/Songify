<template>
  <div class="page-container">
    <button class="home-button" @click="goHome">
      <Icon name="ph:house" size="40" />
    </button>
    <div v-if="album" class="album-container">
      <div class="album-header">
        <img
          :src="album.images[0]?.url"
          alt="Album Image"
          width="200"
          class="album-image"
        />
        <div class="album-info">
          <span class="album-type">{{ album.album_type.toUpperCase() }}</span>
          <h1 class="album-title">{{ album.name }}</h1>
          <div class="album-meta">
            <span v-if="album.artists">
              <span v-for="(artist, index) in album.artists" :key="artist.id">
                <a @click="goToArtist(artist.id)" class="artist-link">{{ artist.name }}</a>
                <span v-if="index < album.artists.length - 1">, </span>
              </span> •
            </span>
            <span>{{ new Date(album.release_date).getFullYear() }} • </span>
            <span>{{ album.total_tracks }} tracks</span>
          </div>
          <a
            :href="album.external_urls?.spotify"
            target="_blank"
            class="play-button"
          >
            Play album
          </a>
        </div>
      </div>

      <div class="tracks-container">
        <div
          v-for="(track, index) in album.tracks.items"
          :key="track.id"
          class="track-item"
        >
          <div class="track-number">{{ index + 1 }}</div>
          <div class="track-info" @click="goToTrack(track.id)">
            <div class="track-name">{{ track.name }}</div>
            <div class="track-artists">
              {{ track.artists.map((artist) => artist.name).join(", ") }}
            </div>
          </div>
          <div class="track-duration">
            {{ formatDuration(track.duration_ms) }}
          </div>
        </div>
      </div>
    </div>
    <div v-else class="not-found">
      <h2>Loading...</h2>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const album = ref(null);
const route = useRoute();
const albumId = route.params.id;
const router = useRouter();

onMounted(async () => {
  const token = localStorage.getItem("access_token");
  if (!token) return;

  try {
    const res = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch album");
    album.value = await res.json();
  } catch (err) {
    console.error("Error fetching album:", err);
  }
});

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const goToTrack = (trackId) => {
  router.push(`/track/${trackId}`);
};
const goHome = () => {
  router.push("/Home");
};
const goToArtist = (artistId) => {
  router.push(`/artist/${artistId}`);
};
</script>

<style scoped>
.page-container {
  padding: 16px;
}
.artist-link {
    color: inherit;
    text-decoration: none;
    cursor: pointer;
}

.artist-link:hover {
    text-decoration: underline;
}
.home-button {
  padding: 8px;
  background: transparent;
  color: white;
  border: none;
  height: 50px;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
  z-index: 100;
}
.album-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(#1f1f1f, #121212);
  border-radius: 8px;
  color: #fff;
}

.album-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: flex-end;
}

.album-image {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.album-info {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.album-type {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #b3b3b3;
}

.album-title {
  font-size: 2.5rem;
  margin: 0.5rem 0;
}

.album-meta {
  color: #b3b3b3;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
}

.tracks-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 2rem;
}

.track-item {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  gap: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.track-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.track-number {
  color: #b3b3b3;
  font-size: 0.875rem;
  text-align: center;
}

.track-info {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.track-name {
  font-size: 0.95rem;
}

.track-artists {
  color: #b3b3b3;
  font-size: 0.875rem;
}

.track-duration {
  color: #b3b3b3;
  font-size: 0.875rem;
}

.play-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #1db954;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  width: fit-content;
}

.play-button:hover {
  background-color: #1ed760;
  transform: scale(1.03);
}

.not-found {
  text-align: center;
  padding: 2rem;
  color: #b3b3b3;
}
</style>
