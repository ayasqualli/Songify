<template>
  <div class="page-container">
    <button class="home-button" @click="goHome">
      <Icon name="ph:house" size="40" />
    </button>
    <div v-if="playlist" class="playlist-container">
      <div class="playlist-header">
        <div class="playlist-cover-container">
          <img
            v-if="playlist.images && playlist.images.length > 0"
            :src="playlist.images[0]?.url"
            class="playlist-cover"
          />
          <div
            v-else
            class="default-cover-overlay"
            style="width: 232px; height: 232px; display: flex; align-items: center; justify-content: center; background-color: #282828; border-radius: 4px;"
          >
            <Icon name="ph:music-notes" size="64" class="default-cover-icon" style="color: #b3b3b3;" />
          </div>
        </div>
        <div class="playlist-info">
          <span class="playlist-type">PLAYLIST</span>

          <div v-if="isEditing" class="edit-form">
            <input
              type="text"
              v-model="editData.name"
              class="edit-input name-input"
              placeholder="Playlist name"
            />
            <textarea
              v-model="editData.description"
              class="edit-input description-input"
              placeholder="Add an optional description"
            ></textarea>
            <div class="edit-buttons">
              <button
                @click="savePlaylistChanges"
                class="save-button"
                :disabled="saving"
              >
                {{ saving ? "Saving..." : "Save" }}
              </button>
              <button @click="cancelEditing" class="cancel-button">
                Cancel
              </button>
            </div>
          </div>

          <div v-else>
            <h1>{{ playlist.name }}</h1>
            <p class="playlist-description">{{ playlist.description }}</p>
          </div>

          <div class="playlist-meta">
            <span class="owner">{{ playlist.owner.display_name }}</span>
            <span class="dot">•</span>
            <span class="tracks-count">{{ playlist.tracks.total }} tracks</span>
            <span class="dot">•</span>
            <span class="followers"
              >{{
                formatNumber(playlist.followers?.total || 0)
              }}
              followers</span
            >
          </div>
          <div class="buttons-row">
            <a
              :href="playlist.external_urls?.spotify"
              target="_blank"
              class="play-button"
            >
              Play
            </a>
            <div v-if="isUserPlaylistOwner" class="owner-buttons">
              <button @click="startEditing" class="photo-button">
                Edit details
              </button>
              <button @click="addSongsToPlaylist" class="photo-button">
                Add Songs
              </button>
              <button @click="showImageUploadModal = true" class="photo-button">
                Change Photo
              </button>
              <button @click="confirmDeletePlaylist" class="delete-button">
                Delete Playlist
              </button>
            </div>
          </div>

          <!-- Image Upload Modal -->
          <div
            v-if="showImageUploadModal"
            class="modal-overlay"
            @click.self="showImageUploadModal = false"
          >
            <div class="modal-content">
              <h3>Change Playlist Image</h3>
              <div
                class="upload-area"
                @click="triggerFileInput"
                @dragover.prevent
                @drop="onFileDrop"
              >
                <input
                  type="file"
                  ref="fileInput"
                  @change="onFileSelected"
                  accept="image/*"
                  style="display: none"
                />
                <div v-if="imagePreview" class="image-preview">
                  <img :src="imagePreview" alt="Preview" />
                </div>
                <div v-else class="upload-placeholder">
                  <span>Drop image here or click to select</span>
                  <p class="upload-note">Recommended: 300x300px JPEG</p>
                </div>
              </div>
              <div class="modal-buttons">
                <button
                  @click="uploadImage"
                  class="save-button"
                  :disabled="!selectedFile || uploading"
                >
                  {{ uploading ? "Uploading..." : "Upload" }}
                </button>
                <button
                  @click="showImageUploadModal = false"
                  class="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <!-- Delete Confirmation Modal -->
          <div
            v-if="showDeleteModal"
            class="modal-overlay"
            @click.self="showDeleteModal = false"
          >
            <div class="modal-content delete-modal">
              <h3>Delete Playlist?</h3>
              <p>
                Are you sure you want to delete "{{ playlist.name }}"? This
                cannot be undone.
              </p>
              <div class="modal-buttons">
                <button
                  @click="deletePlaylist"
                  class="delete-confirm-button"
                  :disabled="deleting"
                >
                  {{ deleting ? "Deleting..." : "Delete" }}
                </button>
                <button @click="showDeleteModal = false" class="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="playlist-content">
        <h1>Tracks</h1>
        <div class="tracks-list">
          <div
            v-for="(item, index) in playlist.tracks.items"
            :key="item.track?.id || `track-${index}`"
            class="track-item"
            @click="item.track?.id && navigateToTrack(item.track.id)"
          >
            <div class="track-number">{{ index + 1 }}</div>
            <div class="track-title">
              <img
                :src="
                  item.track.album.images && item.track.album.images.length > 0
                    ? item.track.album.images[2]?.url ||
                      item.track.album.images[0]?.url
                    : '/default-track.png'
                "
                :alt="item.track.name"
                class="track-image"
              />
              <div class="track-info">
                <div class="track-name">{{ item.track.name }}</div>
                <div class="track-artists">
                  <span v-if="item.track.artists && item.track.artists.length">
                    <span
                      v-for="(artist, artistIndex) in item.track.artists"
                      :key="artist.id || `artist-${artistIndex}`"
                      @click.stop="artist.id && navigateToArtist(artist.id)"
                    >
                      {{ artist.name || "Unknown Artist" }}
                      <span v-if="artistIndex < item.track.artists.length - 1"
                        >,
                      </span>
                    </span>
                  </span>
                  <span v-else>Unknown Artist</span>
                </div>
              </div>
            </div>
            <div
              class="track-album"
              @click.stop="
                item.track.album?.id && navigateToAlbum(item.track.album.id)
              "
            >
              {{ item.track.album?.name || "Unknown Album" }}
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
    <div v-if="!playlist" class="loading">
      <h2>Loading playlist...</h2>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, reactive } from "vue";

const playlist = ref(null);
const route = useRoute();
const router = useRouter();
const playlistId = route.params.id;
const isUserPlaylistOwner = ref(false);
const currentUserId = ref("");
const isEditing = ref(false);
const saving = ref(false);
const showImageUploadModal = ref(false);
const showDeleteModal = ref(false);
const selectedFile = ref(null);
const fileInput = ref(null);
const imagePreview = ref("");
const uploading = ref(false);
const deleting = ref(false);
const notification = ref(null);

// Object to store editing data
const editData = reactive({
  name: "",
  description: "",
});

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const addSongsToPlaylist = () => {
  router.push(`/addToPlaylist/${playlistId}`);
};

const goHome = () => {
  router.push(`/Home`);
};

// Start editing playlist details
const startEditing = () => {
  editData.name = playlist.value.name;
  editData.description = playlist.value.description || "";
  isEditing.value = true;
};

// Cancel editing and revert changes
const cancelEditing = () => {
  isEditing.value = false;
};

// Save playlist changes (name and description)
const savePlaylistChanges = async () => {
  if (!editData.name.trim()) {
    alert("Playlist name cannot be empty");
    return;
  }

  saving.value = true;
  const token = localStorage.getItem("access_token");
  if (!token) return;

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editData.name.trim(),
          description: editData.description.trim(),
          public: playlist.value.public,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update playlist: ${response.status}`);
    }

    // Update local data
    playlist.value.name = editData.name.trim();
    playlist.value.description = editData.description.trim();
    isEditing.value = false;
    alert("Playlist details updated successfully!", "success");
  } catch (error) {
    console.error("Error updating playlist:", error);
    alert(`Failed to update playlist: ${error.message}`, "error");
  } finally {
    saving.value = false;
  }
};

// Trigger file input click
const triggerFileInput = () => {
  fileInput.value.click();
};

// Handle file selection from input
const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    handleSelectedFile(file);
  }
};

// Handle file drop
const onFileDrop = (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    handleSelectedFile(file);
  } else {
    alert("Please upload an image file", "error");
  }
};

// Process the selected file and resize if needed
const handleSelectedFile = (file) => {
  if (file.size > 4 * 1024 * 1024) {
    // 4MB limit for initial upload
    alert("Image must be smaller than 4MB", "error");
    return;
  }

  // Check if it's an image file
  if (!file.type.startsWith("image/")) {
    alert("Please select a valid image file", "error");
    return;
  }

  // Create image preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;

    // If file is large, we'll need to resize it before upload
    if (file.size > 200 * 1024) {
      // If larger than ~200KB, resize
      resizeImage(e.target.result);
    } else {
      selectedFile.value = file; // Use original file if small enough
    }
  };
  reader.readAsDataURL(file);
};

// Resize image to fit Spotify's requirements
const resizeImage = (dataUrl) => {
  const img = new Image();
  img.onload = () => {
    // Create canvas for resizing
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Target dimensions (300x300 is good for playlist covers)
    const maxDimension = 300;

    // Calculate new dimensions while maintaining aspect ratio
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      }
    } else {
      if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    // Set canvas dimensions and draw resized image
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to JPEG with lower quality to reduce size
    const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.8);

    // Create a new file from the resized data
    fetch(resizedDataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        // Create a new File object
        const resizedFile = new File([blob], "playlist-cover.jpg", {
          type: "image/jpeg",
          lastModified: new Date().getTime(),
        });

        console.log(
          `Original size: ${Math.round(
            selectedFile.value?.size / 1024
          )}KB, Resized: ${Math.round(resizedFile.size / 1024)}KB`
        );

        // Update the selected file with our resized version
        selectedFile.value = resizedFile;
      })
      .catch((err) => {
        console.error("Error resizing image:", err);
        alert("Could not process image. Please try another one.", "error");
      });
  };

  img.src = dataUrl;
};

// Upload image to the playlist
const uploadImage = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;
  const token = localStorage.getItem("access_token");
  if (!token) return;

  try {
    // Convert file to base64
    const base64String = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove the "data:image/jpeg;base64," part
        const base64 = reader.result.toString().split(",")[1];
        resolve(base64);
      };
      reader.readAsDataURL(selectedFile.value);
    });
    // Check if the image is not too large (Spotify limits to 256KB)
    const estimatedSize = base64String.length * 0.75; // Approximate size in bytes
    console.log(
      `Estimated base64 image size: ${Math.round(estimatedSize / 1024)}KB`
    );

    if (estimatedSize > 256 * 1024) {
      throw new Error("Image is too large. Maximum size is 256KB.");
    }

    console.log("Uploading image to Spotify API");

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/images`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "image/jpeg",
          },
          body: base64String,
          mode: "cors",
          credentials: "same-origin",
        }
      );

      console.log("Upload response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "No error details");
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to upload image: ${response.status} ${errorText}`
        );
      }

      // Verify the response
      console.log("Image upload successful");
    } catch (fetchError) {
      console.error("Fetch error during upload:", fetchError);
      throw fetchError;
    }

    // Refresh playlist data to get the new image
    const playlistResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (playlistResponse.ok) {
      const updatedPlaylist = await playlistResponse.json();
      playlist.value.images = updatedPlaylist.images;
    }

    // Reset image upload state
    selectedFile.value = null;
    imagePreview.value = "";
    showImageUploadModal.value = false;
    alert("Playlist image updated successfully!", "success");
  } catch (error) {
    console.error("Error uploading image:", error);

    // Handle specific error cases
    if (
      error.message.includes("NetworkError") ||
      error.message.includes("Failed to fetch")
    ) {
      alert(
        "Network error. Please check your internet connection and try again.",
        "error"
      );
    } else if (error.message.includes("401")) {
      // Auth token might be expired
      alert(
        "Authentication error. Please refresh the page and try again.",
        "error"
      );
      // Try to refresh the token
      refreshAuthToken();
    } else if (
      error.message.includes("413") ||
      error.message.includes("too large")
    ) {
      alert(
        "Image is too large. Please use a smaller image or let us resize it for you.",
        "error"
      );
    } else {
      alert(`Failed to upload image: ${error.message}`, "error");
    }
  } finally {
    uploading.value = false;
  }
};

// Helper to refresh auth token if expired
const refreshAuthToken = async () => {
  // This is a placeholder for actual token refresh logic
  // You would typically use a refresh token to get a new access token
  console.log("Token refresh would happen here");

  // For now, we'll just suggest the user to log in again
  const refreshToken = localStorage.getItem("refresh_token");
  if (refreshToken) {
    try {
      // If you have refresh token logic, implement it here
      // Example: await refreshSpotifyToken(refreshToken);
      console.log("Would refresh with token:", refreshToken);
    } catch (err) {
      console.error("Failed to refresh token:", err);
    }
  }
};

// Show delete confirmation modal
const confirmDeletePlaylist = () => {
  showDeleteModal.value = true;
};

// Delete the playlist
const deletePlaylist = async () => {
  deleting.value = true;
  const token = localStorage.getItem("access_token");
  if (!token) return;

  try {
    // Spotify API doesn't directly support deleting playlists,
    // so we'll unfollowPlaylists the playlist instead, which effectively removes it from the user's library
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/followers`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete playlist: ${response.status}`);
    }

    // Redirect to the playlists page after successful deletion
    router.push("/myPlaylists");
  } catch (error) {
    console.error("Error deleting playlist:", error);
    alert(`Failed to delete playlist: ${error.message}`, "error");
    showDeleteModal.value = false;
  } finally {
    deleting.value = false;
  }
};

const navigateToTrack = (id) => router.push(`/track/${id}`);
const navigateToArtist = (id) => router.push(`/artist/${id}`);
const navigateToAlbum = (id) => router.push(`/album/${id}`);

onMounted(async () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    alert("Not logged in. Please log in to view playlists.", "error");
    router.push("/");
    return;
  }

  try {
    // Validate token first
    const validationRes = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!validationRes.ok) {
      if (validationRes.status === 401) {
        console.log("Token expired, attempting to refresh...");
        await refreshAuthToken();
        alert("Session expired. Please try again.", "error");
        return;
      }
      throw new Error(`Failed to validate token: ${validationRes.status}`);
    }

    // Fetch user profile to get current user ID
    const profileData = await validationRes.json();
    currentUserId.value = profileData.id;

    // Fetch playlist details
    const res = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      if (res.status === 404) {
        alert(
          "Playlist not found or you don't have permission to view it.",
          "error"
        );
        router.push("/myPlaylists");
        return;
      }
      throw new Error(`Failed to fetch playlist: ${res.status}`);
    }

    playlist.value = await res.json();

    // Check if current user is the playlist owner
    if (playlist.value && playlist.value.owner && currentUserId.value) {
      isUserPlaylistOwner.value =
        playlist.value.owner.id === currentUserId.value;
      console.log(
        `User is ${isUserPlaylistOwner.value ? "" : "not "}the playlist owner`
      );
    }
  } catch (err) {
    console.error("Error fetching playlist:", err);
    alert(`Error loading playlist: ${err.message}`, "error");
  }
});
</script>

<style scoped>
.page-container {
  padding: 16px;
}
.playlist-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(#1f1f1f, #121212);
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

.playlist-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: flex-end;
  padding: 2rem 0;
  border: none;
  padding-left: 0;
}

.playlist-cover {
  width: 232px;
  height: 232px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
}

.playlist-info {
  flex: 1;
}

.playlist-type {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #b3b3b3;
}

.playlist-info h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0.5rem 0;
  line-height: 1;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.playlist-description {
  color: #b3b3b3;
  margin: 1rem 0;
}

.playlist-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #b3b3b3;
  font-size: 0.875rem;
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

.owner-controls {
  margin-left: auto;
}

.edit-button {
  background: transparent;
  color: #b3b3b3;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.edit-button:hover {
  color: #fff;
  text-decoration: underline;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 100%;
}

.edit-input {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: white;
  padding: 0.75rem;
  width: 100%;
  font-family: inherit;
}

.name-input {
  font-size: 1.5rem;
  font-weight: 600;
}

.description-input {
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
}

.edit-buttons {
  display: flex;
  gap: 1rem;
}

.save-button,
.cancel-button {
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-button {
  background-color: #1db954;
  color: white;
  border: none;
}

.save-button:hover {
  background-color: #1ed760;
}

.save-button:disabled {
  background-color: #1db95480;
  cursor: not-allowed;
}

.cancel-button {
  background-color: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.cancel-button:hover {
  border-color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #282828;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: white;
}

.upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: border-color 0.2s;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #1db954;
}

.upload-placeholder {
  color: #b3b3b3;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-note {
  font-size: 0.875rem;
  margin: 0;
}

.image-preview {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.owner-buttons {
  margin-top: 15px;
  display: flex;
  gap: 0.5rem;
}

.photo-button,
.delete-button {
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  background-color: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
}

.photo-button:hover,
.delete-button:hover {
  border-color: white;
}

.delete-button {
  color: #ff5252;
  border-color: rgba(255, 82, 82, 0.5);
}

.delete-button:hover {
  color: white;
  background-color: #ff5252;
  border-color: #ff5252;
}

.delete-modal p {
  color: #b3b3b3;
  margin-bottom: 1.5rem;
}

.delete-confirm-button {
  background-color: #ff5252;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-confirm-button:hover {
  background-color: #ff6b6b;
}

.delete-confirm-button:disabled {
  background-color: #ff525280;
  cursor: not-allowed;
}

.default-icon {
  display: block;
  width: 200px;
  height: auto;
  margin-right: 10px;
  align-items: center;
  justify-content: center;
}
</style>
