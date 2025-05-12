<template>
    <div class="page-container">
        <button class="home-button" @click="goHome">
        <Icon name="ph:house" size="40" />
      </button>
    <div v-if="track" class="track-container">
        <div class="track-header">
            <img :src="track.album.images[0]?.url" alt="Album Cover" class="track-image">
            <div class="track-info">
                <span class="track-type">SONG</span>
                <h1>{{ track.name }}</h1>
                <p class="artists">
                    <span v-for="(artist, index) in track.artists" :key="artist.id">
                        <a @click="goToArtist(artist.id)" class="artist-link">{{ artist.name }}</a>
                        <span v-if="index < track.artists.length - 1">, </span>
                    </span>
                </p>
                <div class="track-meta">
                    <img :src="track.album.images[2]?.url" alt="Album Thumbnail" class="album-thumb">
                    <a @click="goToAlbum(track.album.id)" class="album-link">{{ track.album.name }}</a>
                    <span>•</span>
                    <span>{{ new Date(track.album.release_date).getFullYear() }}</span>
                    <span>•</span>
                    <span>{{ formatDuration(track.duration_ms) }}</span>
                </div>
                <a :href="track.external_urls?.spotify" target="_blank" class="play-button">
                    Play track
                </a>
            </div>
        </div>

        <div class="track-details" v-if="audioFeatures">
            <h2>Track Features</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-value">{{ Math.round(audioFeatures.tempo) }}</div>
                    <div class="feature-label">BPM</div>
                </div>
                <div class="feature-card">
                    <div class="feature-value">{{ getPitchNotation(audioFeatures.key) }}</div>
                    <div class="feature-label">Key</div>
                </div>
                <div class="feature-card">
                    <div class="feature-value">{{ audioFeatures.time_signature }}/4</div>
                    <div class="feature-label">Time Signature</div>
                </div>
                <div class="feature-card">
                    <div class="feature-value">{{ Math.round(audioFeatures.danceability * 100) }}</div>
                    <div class="feature-label">Danceability</div>
                </div>
                <div class="feature-card">
                    <div class="feature-value">{{ Math.round(audioFeatures.energy * 100) }}</div>
                    <div class="feature-label">Energy</div>
                </div>
                <div class="feature-card">
                    <div class="feature-value">{{ track.popularity }}</div>
                    <div class="feature-label">Popularity</div>
                </div>
            </div>
        </div>

        <div class="album-context">
            <h2>From the album</h2>
            <div class="album-info" @click="goToAlbum(track.album.id)">
                <img :src="track.album.images[1]?.url" alt="Album Cover" class="album-image">
                <div>
                    <h3>{{ track.album.name }}</h3>
                    <p>Release date: {{ formatDate(track.album.release_date) }}</p>
                    <p class="album-artists">
                        By: {{ track.album.artists.map(artist => artist.name).join(', ') }}
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div v-else>
        <h2>Couldn't find track...</h2>
    </div>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const route = useRoute()
const router = useRouter()
const trackId = route.params.id
const track = ref(null)
const audioFeatures = ref(null)

const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const getPitchNotation = (key) => {
    const pitches = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
    return key >= 0 ? pitches[key] : 'N/A'
}

const goToAlbum = (albumId) => {
    router.push(`/album/${albumId}`)
}

const goToArtist = (artistId) => {
    router.push(`/artist/${artistId}`)
}
const goHome = () => {
  router.push("/Home");
};


onMounted(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
        console.error('No access token found')
        return
    }

    try {
        // Fetch track details
        const trackResponse = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!trackResponse.ok) {
            throw new Error('Failed to fetch track')
        }

        track.value = await trackResponse.json()

       
    } catch (err) {
        console.error('Error fetching track:', err)
    }
})
</script>

<style scoped>
.home-button {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 8px;
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
}

.home-button:hover {
  transform: scale(1.05);
  background-color: #3c3c3c;
}
.track-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.track-header {
    display: flex;
    gap: 2rem;
    margin-bottom: 3rem;
    align-items: flex-end;
}

.track-image {
    width: 300px;
    height: 300px;
    object-fit: cover;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.track-info {
    flex: 1;
}

.track-type {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    display: block;
}

.track-info h1 {
    font-size: 3rem;
    margin: 0.5rem 0;
}

.artists {
    font-size: 1.25rem;
    margin-bottom: 1rem;
}

.artist-link {
    color: inherit;
    text-decoration: none;
    cursor: pointer;
}

.artist-link:hover {
    text-decoration: underline;
}

.track-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #6b7280;
    margin-bottom: 1.5rem;
}

.album-thumb {
    width: 24px;
    height: 24px;
    border-radius: 2px;
}

.album-link {
    color: inherit;
    text-decoration: none;
    cursor: pointer;
}

.album-link:hover {
    text-decoration: underline;
}

.track-details {
    margin-top: 3rem;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.feature-card {
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
}

.feature-value {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.feature-label {
    color: #6b7280;
    font-size: 0.875rem;
}

.album-context {
    margin-top: 3rem;
}

.album-info {
    display: flex;
    gap: 1.5rem;
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: background-color 0.2s;
}

.album-info:hover {
    background: rgba(255, 255, 255, 0.15);
}

.album-image {
    width: 150px;
    height: 150px;
    object-fit: cover;
}

.album-artists {
    color: #6b7280;
    margin-top: 0.5rem;
}

h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

h3 {
    margin: 0;
    font-size: 1.25rem;
}

.play-button {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    background-color: #1DB954;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
}

.play-button:hover {
    background-color: #1ed760;
    transform: scale(1.03);
}

.play-button svg {
    width: 24px;
    height: 24px;
}
</style>