<template>
  <div class="add-to-playlist-container">
    <div class="navigation-buttons">
      <button
        v-if="!isUserAllowedToEdit"
        @click="navigateToPlaylist"
        class="back-button"
      >
        Back to Playlist
      </button>
    </div>
    <button class="home-button" @click="goHome">
      <Icon name="ph:house" size="40" />
    </button>

    <div v-if="!isUserAllowedToEdit" class="permission-error">
      <h2>You don't have permission to edit this playlist</h2>
      <p>Only the playlist owner can add songs.</p>
    </div>

    <div v-else>
      <div class="header-section">
        <div v-if="playlist" class="playlist-info">
          <div class="playlist-cover-container">
            <img
              v-if="playlist.images && playlist.images.length > 0"
              :src="playlist.images[0]?.url"
              class="playlist-cover"
            />
            <div
              v-else
              class="default-cover-overlay"
              style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; background-color: #282828; border-radius: 4px;"
            >
              <Icon name="ph:music-notes" size="64" class="default-cover-icon" style="color: #b3b3b3;" />
            </div>
          </div>
          <h1 class="playlist-name">{{ playlist.name }}</h1>
          <p class="description">Search for songs to add to this playlist</p>
        </div>
        <div v-else class="loading-playlist">
          <h1>Loading playlist...</h1>
        </div>
      </div>

      <div class="search-box">
        <input
          type="text"
          v-model="searchQuery"
          @input="handleSearch"
          placeholder="Search for songs, artists..."
          class="search-input"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="clear-button"
        >
          ×
        </button>
      </div>

      <div class="search-results" v-if="searchQuery">
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <span>Searching...</span>
        </div>

        <div v-else-if="tracks.length > 0" class="tracks-list">
          <div v-for="track in tracks" :key="track.id" class="track-item">
            <div class="track-info">
              <img
                :src="
                  track.album.images && track.album.images.length > 0
                    ? track.album.images[0].url
                    : '/default-track.png'
                "
                :alt="track.name"
                class="track-image"
              />
              <div class="track-details">
                <div class="track-name">{{ track.name }}</div>
                <div class="track-artist">
                  {{ track.artists.map((artist) => artist.name).join(", ") }}
                </div>
                <div class="track-album">{{ track.album.name }}</div>
              </div>
            </div>
            <button
              @click="addTrackToPlaylist(track.id)"
              class="add-button"
              :disabled="
                addingTrack === track.id || addedTracks.includes(track.id)
              "
            >
              <span v-if="addingTrack === track.id">Adding...</span>
              <span v-else-if="addedTracks.includes(track.id)">Added</span>
              <span v-else>Add</span>
            </button>
          </div>
        </div>

        <div v-else-if="searchQuery && !loading" class="no-results">
          <p>No tracks found for "{{ searchQuery }}"</p>
        </div>
      </div>

      <div v-else-if="!searchQuery && !loading" class="empty-search">
        <p>Search for songs to add to this playlist</p>
        <span class="tip">Try searching by song title, artist, or album</span>
      </div>

      <div class="added-tracks" v-if="addedTracks.length > 0">
        <hr class="divider" />
        <h2>Added Tracks ({{ addedTracks.length }})</h2>
        <button @click="navigateToPlaylist" class="done-button">Done</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const playlistId = route.params.id;

const playlist = ref(null);
const searchQuery = ref("");
const tracks = ref([]);
const loading = ref(false);
const searchTimeout = ref(null);
const addingTrack = ref(null);
const addedTracks = ref([]);
const currentUserId = ref("");
const isUserAllowedToEdit = ref(false);

// Fetch playlist details and user permissions
onMounted(async () => {
  const token = localStorage.getItem("access_token");

  // Check if the token is valid by fetching the user's profile
  try {
    const profileRes = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!profileRes.ok) {
      // If the token is invalid, redirect to the login page
      router.push("/login");
      return;
    }

    const profileData = await profileRes.json();
    currentUserId.value = profileData.id;

    // Now fetch the playlist
    const playlistRes = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!playlistRes.ok) {
      throw new Error(`Error fetching playlist: ${playlistRes.status}`);
    }

    playlist.value = await playlistRes.json();

    // Check if the current user is the owner of the playlist
    isUserAllowedToEdit.value =
      playlist.value.owner && playlist.value.owner.id === currentUserId.value;

    if (!isUserAllowedToEdit.value) {
      alert("You don't have permission to edit this playlist.");
    }
  } catch (error) {
    console.error("Error loading playlist:", error);
    alert("Could not load the playlist. Please try again later.");
  }
});

// Debounce the search input
const handleSearch = () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value);

  if (searchQuery.value.trim() === "") {
    tracks.value = [];
    loading.value = false;
    return;
  }

  loading.value = true;
  searchTimeout.value = setTimeout(searchTracks, 500);
};

const goHome = () => {
    router.push('/Home');
};

// Search for tracks
const searchTracks = async () => {
  if (!searchQuery.value.trim()) {
    tracks.value = [];
    loading.value = false;
    return;
  }

  const token = localStorage.getItem("access_token");
  if (!token) return;

  try {
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        searchQuery.value
      )}&type=track&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Error searching tracks: ${res.status}`);
    }

    const data = await res.json();
    tracks.value = data.tracks.items;
  } catch (error) {
    console.error("Error searching tracks:", error);
  } finally {
    loading.value = false;
  }
};

// Add track to playlist
const addTrackToPlaylist = async (trackId) => {
  if (addedTracks.value.includes(trackId)) return;

  const token = localStorage.getItem("access_token");
  if (!token) return;

  addingTrack.value = trackId;

  // Find track name for notification
  const track = tracks.value.find((t) => t.id === trackId);
  const trackName = track ? track.name : "track";

  try {
    const res = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [`spotify:track:${trackId}`],
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(`Error adding track: ${res.status} - ${errorData}`);
    }

    addedTracks.value.push(trackId);
    alert(`"${trackName}" added to playlist successfully!`);
  } catch (error) {
    console.error("Error adding track to playlist:", error);
    alert(
      `Failed to add "${trackName}" to playlist. ${
        error.message.includes("403")
          ? "You may not have permission to modify this playlist."
          : "Please try again."
      }`
    );
  } finally {
    addingTrack.value = null;
  }
};

// Navigate back to playlist page
const navigateToPlaylist = () => {
  router.push(`/playlist/${playlistId}`);
};

// Watch for changes to the search query
watch(searchQuery, (newVal) => {
  if (newVal === "") {
    tracks.value = [];
  }
});
</script>

<style scoped>
.add-to-playlist-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: #ffffff;
  position: relative;
}

.navigation-buttons {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-bottom: 2rem;
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

.back-button {
  background-color: #1db954;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #1ed760;
  transform: scale(1.05);
}

.header-section {
  margin-bottom: 2rem;
}

.playlist-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.playlist-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  object-fit: cover;
}

.description {
  color: #b3b3b3;
  margin-top: 0.5rem;
}

.search-section {
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  max-width: 600px;
}

.search-input {
  width: 100%;
  padding: 1rem;
  background: rgba(112, 112, 112, 0.1);
  border: 1px solid rgba(71, 71, 71, 0.3);
  border-radius: 24px;
  color: #ffffff;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #1db954;
}

.clear-button {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #b3b3b3;
  font-size: 1.5rem;
  cursor: pointer;
}

.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.track-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.track-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.track-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.track-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}

.track-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.track-name {
  font-weight: 500;
}

.track-artist,
.track-album {
  font-size: 0.875rem;
  color: #b3b3b3;
}

.add-button {
  background-color: #1db954;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-button:hover:not(:disabled) {
  background-color: #1ed760;
  transform: scale(1.05);
}

.add-button:disabled {
  opacity: 0.7;
  cursor: default;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
  color: #b3b3b3;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #1db954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.no-results,
.empty-search {
  text-align: center;
  padding: 3rem 0;
  color: #b3b3b3;
}

.tip {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.7;
}

.divider {
  margin: 2rem 0;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.added-tracks {
  text-align: center;
}

.added-tracks h2 {
  margin-bottom: 1rem;
}

.done-button {
  background-color: #1db954;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.done-button:hover {
  background-color: #1ed760;
  transform: scale(1.05);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .add-to-playlist-container {
    padding: 1rem;
  }

  .playlist-info {
    flex-direction: column;
    align-items: flex-start;
    text-align: center;
  }

  .track-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .track-item {
    flex-direction: column;
    gap: 1rem;
  }

  .add-button {
    width: 100%;
  }
}
</style>
