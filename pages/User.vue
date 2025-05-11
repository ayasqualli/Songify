<template>
  <div class="page-container">
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
        <h1 class="profile-name">{{ profile.display_name }}</h1>
        <p>Public Playlist * {{ Followers }} Following</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const profile = ref(null);

onMounted(async () => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.error("Token manquant. Redirection vers /Home");
    window.location.href = "/Home";
    return;
  }

  try {
    const resProfile = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resProfile.ok) {
      throw new Error(`Failed to fetch profile: ${resProfile.statusText}`);
    }

    profile.value = await resProfile.json();
  } catch (err) {
    console.error("Erreur Spotify:", err);
  }
});

const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("spotify_profile");
  router.push("/");
};
</script>

<style scoped>

.page-container{
    padding: 16px;
}
.profile-header {
  display: flex;
  flex-direction: row;
  background: linear-gradient (to top, #555555, #2c2c2c);
  border-radius: 16px;
}
</style>
