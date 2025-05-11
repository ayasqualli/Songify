<template>
    <div class="artist-detail">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
      </div>
      <div v-else>
        <div class="artist-header">
          <img :src="artist.image" :alt="artist.name" class="artist-image">
          <h1>{{ artist.name }}</h1>
          <p class="artist-genre">{{ artist.genre }}</p>
        </div>
        
        <div class="artist-content">
          <section class="popular-tracks">
            <h2>Popular Tracks</h2>
            <ul v-if="artist.popularTracks.length">
              <li v-for="track in artist.popularTracks" :key="track.id">
                <span class="track-name">{{ track.name }}</span>
                <span class="track-duration">{{ formatDuration(track.duration_ms) }}</span>
              </li>
            </ul>
            <p v-else>No tracks available</p>
          </section>
  
          <section class="related-artists">
            <h2>Related Artists</h2>
            <div class="related-artists-grid" v-if="artist.relatedArtists.length">
              <div v-for="relatedArtist in artist.relatedArtists" :key="relatedArtist.id" class="related-artist" @click="navigateToArtist(relatedArtist.id)">
                <img :src="relatedArtist.image" :alt="relatedArtist.name">
                <h3>{{ relatedArtist.name }}</h3>
              </div>
            </div>
            <p v-else>No related artists found</p>
          </section>
  
          <section class="artist-bio">
            <h2>About</h2>
            <p>{{ artist.bio || 'No biography available for this artist.' }}</p>
          </section>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  
  export default {
    setup() {
      const route = useRoute();
      const router = useRouter();
      const artist = ref({
        name: '',
        image: '',
        genre: '',
        bio: '',
        popularTracks: [],
        relatedArtists: []
      });
      const loading = ref(true);
      const error = ref(null);
  
      const formatDuration = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      };
  
      const navigateToArtist = (artistId) => {
        router.push({ name: 'ArtistDetails', params: { id: artistId } });
      };
  
      const fetchArtistDetails = async (artistId) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          error.value = "Authentication token missing. Please login again.";
          loading.value = false;
          return;
        }
  
        try {
          // Parallel fetching of artist data, top tracks, and related artists
          const [artistResponse, tracksResponse, relatedResponse] = await Promise.all([
            fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
              headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
              headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(`https://api.spotify.com/v1/artists/${artistId}/related-artists`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);
  
          // Check responses
          if (!artistResponse.ok) throw new Error('Failed to fetch artist details');
          if (!tracksResponse.ok) throw new Error('Failed to fetch top tracks');
          if (!relatedResponse.ok) throw new Error('Failed to fetch related artists');
  
          // Parse responses
          const [artistData, tracksData, relatedData] = await Promise.all([
            artistResponse.json(),
            tracksResponse.json(),
            relatedResponse.json()
          ]);
  
          // Format artist data
          artist.value = {
            name: artistData.name,
            image: artistData.images && artistData.images.length > 0 
              ? artistData.images[0].url 
              : '/default-artist.png',
            genre: artistData.genres && artistData.genres.length > 0 
              ? artistData.genres.join(', ') 
              : 'Genre not available',
            bio: 'Bio not available from Spotify API', // Spotify API doesn't provide bio directly
            popularTracks: tracksData.tracks || [],
            relatedArtists: (relatedData.artists || []).map(artist => ({
              id: artist.id,
              name: artist.name,
              image: artist.images && artist.images.length > 0 
                ? artist.images[0].url 
                : '/default-artist.png'
            }))
          };
        } catch (error) {
          console.error('Error fetching artist details:', error);
          error.value = `Error loading artist: ${error.message}`;
        } finally {
          loading.value = false;
        }
      };
  
      onMounted(() => {
        if (route.params.id) {
          fetchArtistDetails(route.params.id);
        } else {
          error.value = "No artist ID provided";
          loading.value = false;
        }
      });
  
      return {
        artist,
        loading,
        error,
        formatDuration,
        navigateToArtist
      };
    }
  };
  </script>
  
  <style scoped>
  .artist-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .artist-header {
    text-align: center;
    margin-bottom: 40px;
  }
  
  .artist-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .artist-header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
  }
  
  .artist-genre {
    font-size: 1.2rem;
    color: #b3b3b3;
  }
  
  .artist-content {
    text-align: left;
  }
  
  .popular-tracks h2,
  .related-artists h2,
  .artist-bio h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
  
  .popular-tracks ul {
    list-style-type: none;
    padding: 0;
  }
  
  .popular-tracks li {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #333;
  }
  
  .track-name {
    font-size: 1rem;
  }
  
  .track-duration {
    font-size: 0.9rem;
    color: #b3b3b3;
  }
  
  .related-artists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
  }
  
  .related-artist {
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .related-artist:hover {
    transform: scale(1.05);
  }
  
  .related-artist img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 10px;
  }
  
  .related-artist h3 {
    font-size: 1rem;
  }
  
  .artist-bio p {
    font-size: 1rem;
    line-height: 1.6;
    color: #b3b3b3;
  }
  
  .loading, .error {
    text-align: center;
    padding: 50px 0;
    color: #b3b3b3;
  }
  
  .error {
    color: #e74c3c;
  }
  </style>