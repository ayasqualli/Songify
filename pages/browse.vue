<template>
  <div class="page-container">
    <button class="home-button" @click="goHome">
      <Icon name="ph:house" size="40" />
    </button>
    <main class="content">
      <section class="header-section">
        <NavBar />
      </section>
      <div class="new-releases-container">
        <h1>New Releases</h1>
        <div class="albums-grid">
          <div
            v-for="album in newReleases"
            :key="album.id"
            class="album-card"
            @click="navigateToAlbum(album.id)"
          >
            <img
              :src="album.images[0]?.url"
              :alt="album.name"
              class="album-cover"
            />
            <div class="album-info">
              <h3 class="album-name">{{ album.name }}</h3>
              <p class="album-artist">{{ album.artists[0]?.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import NavBar from "~/components/NavBar.vue";

const router = useRouter();
const newReleases = ref([]);

const goHome = () => {
  router.push(`/Home`);
};

const navigateToAlbum = (id) => router.push(`/album/${id}`);

onMounted(async () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    alert("Not logged in. Please log in to view new releases.", "error");
    router.push("/");
    return;
  }

  try {
    const response = await fetch(
      "https://api.spotify.com/v1/browse/new-releases?limit=50",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch new releases: ${response.status}`);
    }

    const data = await response.json();
    newReleases.value = data.albums.items;
  } catch (err) {
    console.error("Error fetching new releases:", err);
    alert(`Error loading new releases: ${err.message}`, "error");
  }
});
</script>

<style scoped>
.page-container {
  padding: 16px;
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

.new-releases-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(#1f1f1f, #121212);
  border-radius: 8px;
  border-radius: 8px;
  color: #fff;
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

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.album-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.album-card:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.album-cover {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.album-info {
  text-align: center;
}

.album-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0.5rem 0;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-artist {
  font-size: 0.875rem;
  color: #b3b3b3;
  margin: 0;
}
</style>