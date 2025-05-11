<template>
    <div v-if="playlist" class="playlist-container">
        <div class="playlist-header">
            <img :src="playlist.images[0]?.url" 
                 alt="Playlist Cover" 
                 class="playlist-cover" />
            <div class="playlist-info">
                <span class="playlist-type">PLAYLIST</span>
                <h1>{{ playlist.name }}</h1>
                <p class="playlist-description">{{ playlist.description }}</p>
                <div class="playlist-meta">
                    <span class="owner">{{ playlist.owner.display_name }}</span>
                    <span class="dot">•</span>
                    <span class="tracks-count">{{ playlist.tracks.total }} tracks</span>
                    <span class="dot">•</span>
                    <span class="followers">{{ formatNumber(playlist.followers?.total || 0) }} followers</span>
                </div>
            </div>
        </div>

        <div class="playlist-content">
            <div class="tracks-header">
                <div class="track-number">#</div>
                <div class="track-title">TITLE</div>
                <div class="track-album">ALBUM</div>
                <div class="track-date-added">DATE ADDED</div>
                <div class="track-duration">DURATION</div>
            </div>

            <div class="tracks-list">
                <div v-for="(item, index) in playlist.tracks.items" 
                     :key="item.track.id"
                     class="track-item"
                     @click="navigateToTrack(item.track.id)">
                    <div class="track-number">{{ index + 1 }}</div>
                    <div class="track-title">
                        <img :src="item.track.album.images[2]?.url" 
                             :alt="item.track.name"
                             class="track-image">
                        <div class="track-info">
                            <div class="track-name">{{ item.track.name }}</div>
                            <div class="track-artists">
                                <span v-for="(artist, artistIndex) in item.track.artists" 
                                      :key="artist.id"
                                      @click.stop="navigateToArtist(artist.id)">
                                    {{ artist.name }}
                                    <span v-if="artistIndex < item.track.artists.length - 1">, </span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="track-album" @click.stop="navigateToAlbum(item.track.album.id)">
                        {{ item.track.album.name }}
                    </div>
                    <div class="track-date-added">
                        {{ formatDate(item.added_at) }}
                    </div>
                    <div class="track-duration">
                        {{ formatDuration(item.track.duration_ms) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="loading">
        <h2>Loading playlist...</h2>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';

const playlist = ref(null);
const route = useRoute();
const router = useRouter();
const playlistId = route.params.id;

const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const navigateToTrack = (id) => router.push(`/track/${id}`);
const navigateToArtist = (id) => router.push(`/artist/${id}`);
const navigateToAlbum = (id) => router.push(`/album/${id}`);

onMounted(async () => {
  const token = localStorage.getItem("access_token");
  if (!token) return;

  try {
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch playlist");
    playlist.value = await res.json();
  } catch (err) {
    console.error("Error fetching playlist:", err);
  }
});
</script>

<style scoped>
.playlist-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.playlist-header {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    align-items: flex-end;
}

.playlist-cover {
    width: 232px;
    height: 232px;
    box-shadow: 0 4px 60px rgba(0, 0, 0, .5);
}

.playlist-info {
    flex: 1;
}

.playlist-type {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.playlist-info h1 {
    font-size: 5rem;
    font-weight: 700;
    margin: 0.5rem 0;
    line-height: 1;
}

.playlist-description {
    color: #6b7280;
    margin: 1rem 0;
}

.playlist-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
}

.dot {
    font-size: 0.25rem;
    vertical-align: middle;
}

.tracks-header {
    display: grid;
    grid-template-columns: 50px 1fr 1fr 1fr 100px;
    padding: 0 1rem;
    margin-bottom: 1rem;
    color: #6b7280;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0.5rem;
}

.tracks-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.track-item {
    display: grid;
    grid-template-columns: 50px 1fr 1fr 1fr 100px;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
}

.track-item:hover {
    background: rgba(255, 255, 255, 0.1);
}

.track-title {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.track-image {
    width: 40px;
    height: 40px;
    object-fit: cover;
}

.track-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.track-artists {
    color: #6b7280;
    font-size: 0.875rem;
}

.track-artists span:hover {
    color: #fff;
    text-decoration: underline;
}

.track-album {
    color: #6b7280;
    font-size: 0.875rem;
}

.track-album:hover {
    color: #fff;
    text-decoration: underline;
}

.track-date-added {
    color: #6b7280;
    font-size: 0.875rem;
}

.track-duration {
    color: #6b7280;
    font-size: 0.875rem;
}

.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    color: #6b7280;
}
</style>