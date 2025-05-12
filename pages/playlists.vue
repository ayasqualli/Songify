<template>
  <div class="main-layout" v-if="playlists">
    <aside class="library">
      <div class="logo-container">
        <img src="../assets/small.png" alt="Logo" class="logo" />
      </div>
      <div class="library-header">
        <h2>Library</h2>
        <button class="create-button" @click="router.push('/create-playlist')">
          <span style="font-size: 1.2em; font-weight: bold; margin-right: 4px"
            >+</span
          >
          Create
        </button>
      </div>
      <ul>
    
        <li @click="router.push('/Home')">Home</li>
        <li @click="router.push('/Browse')">Browse</li>
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
            v-for="playlist in playlists.items"
            :key="playlist.id"
            @click="router.push(`/playlist/${playlist.id}`)"
          >
            <div v-if="playlist" class="playlist-container">
              <div class="playlist-cover-container">
                <img
                  v-if="playlist.images && playlist.images.length > 0"
                  :src="playlist.images[0]?.url"
                  class="playlist-cover"
                />
                <div
                  v-else
                  class="default-cover-overlay"
                  style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: transparent; border-radius: 4px;"
                >
                  <Icon name="ph:music-notes" size="64" class="default-cover-icon" style="color: #b3b3b3;" />
                </div>
              </div>
              {{ playlist.name }}
            </div>
          </li>
        </ul>
      </section>
    </main>
  </div>
  <div v-else class="loading">
    Loading playlists...
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';

const router = useRouter();
const playlists = ref(null);
const profile = ref({}); // Added profile ref

onMounted(async () => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    console.error('Token missing. Redirecting to /Home');
    window.location.href = '/Home';
    return;
  }

  try {
    // Fetch profile
    const resProfile = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!resProfile.ok) {
      throw new Error(`Failed to fetch profile: ${resProfile.statusText}`);
    }
    profile.value = await resProfile.json();

    // Fetch playlists
    const resPlaylists = await fetch(
      'https://api.spotify.com/v1/me/playlists',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!resPlaylists.ok) {
      throw new Error(`Failed to fetch playlists: ${resPlaylists.statusText}`);
    }

    playlists.value = await resPlaylists.json();
  } catch (err) {
    console.error('Error fetching data:', err);
    playlists.value = [];
  }
});
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
  background: transparent;
  margin-bottom: 32px;
}

.playlists h1 {
  color: #fff;
  font-size: 40px;
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
  text-align: center;
  margin-top: 40px;
  font-size: 18px;
}
.create-button {
  background-color: rgb(44, 45, 43, 0.7);
  width: 80px;
  border: none;
  padding: 2px;
  border-radius: 16px;
  font-size: 12px;
  margin: 0;
}

.create-button:hover {
  background-color: rgb(44, 45, 43, 0.9);
  transform: scale(1.05);
  transition: all 0.2s ease;
}

.library-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
