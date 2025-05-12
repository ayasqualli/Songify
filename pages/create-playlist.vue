<template>
  <div class="main-layout">
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
        <div class="profile-aligner"></div>
        <div class="profile-container" @click="router.push('/profile')">
          <div class="profile-picture" v-if="!profile.images?.[0]?.url">
            {{ profile.display_name?.charAt(0)?.toUpperCase() }}
          </div>
          <img v-else :src="profile.images?.[0]?.url" alt="Profile Image" />
        </div>
      </section>

      <section class="create-playlist">
        <h1>Create New Playlist</h1>
        <form @submit.prevent="createPlaylist" class="playlist-form">
          <div class="form-group">
            <label for="playlist-name">Playlist Name</label>
            <input
              type="text"
              id="playlist-name"
              v-model="playlistName"
              required
              placeholder="Enter playlist name"
            />
          </div>
          <div class="form-group">
            <label for="playlist-description">Description</label>
            <textarea
              id="playlist-description"
              v-model="playlistDescription"
              placeholder="Enter playlist description"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="playlist-visibility">Visibility</label>
            <select
              id="playlist-visibility"
              v-model="isPublic"
              class="public"
            >
              <option :value="true">Public</option>
              <option :value="false">Private</option>
            </select>
          </div>
          <button type="submit" class="submit-button">Create Playlist</button>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const profile = ref({});
const playlistName = ref("");
const playlistDescription = ref("");
const isPublic = ref(true);

onMounted(async () => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.error("Token missing. Redirecting to /Home");
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
  } catch (err) {
    console.error("Error fetching profile:", err);
  }
});

const createPlaylist = async () => {
  const token = localStorage.getItem("access_token");
  const userId = profile.value.id;

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playlistName.value,
          description: playlistDescription.value,
          public: isPublic.value,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create playlist: ${response.statusText}`);
    }

    const data = await response.json();
    router.push(`/playlist/${data.id}`);
  } catch (err) {
    console.error("Error creating playlist:", err);
    alert("Failed to create playlist. Please try again.");
  }
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

.library-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
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

.create-playlist {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.create-playlist h1{
    margin: 10px;
    font-size: 40px;

}

.playlist-form {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #b3b3b3;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #333;
  background-color: #222;
  color: #fff;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.submit-button {
  background-color: #1db954;
  color: #000;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.submit-button:hover {
  background-color: #1ed760;
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
</style>
