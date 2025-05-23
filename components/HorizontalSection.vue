<template>
    <section class="horizontal-section">
      <h2 class="section-title">{{ title }}</h2>
  
      <ul v-if="items?.length" class="scroll-list">
        <li 
          v-for="item in items" 
          :key="item.id" 
          class="scroll-item"
          @click="navigateToItem(item)"
        >
          <div class="item-container">
            <img
              :src="item.images?.[0]?.url"
              class="item-image"
              :alt="item.name"
            />
            <div class="item-details">
              <h3 class="item-name">{{ item.name }}</h3>
              <p v-if="item.artists" class="item-sub">{{ item.artists[0]?.name }}</p>
            </div>
          </div>
        </li>
      </ul>
  
      <p v-else class="loading">Loading or empty</p>
    </section>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  defineProps({
    title: String,
    items: Array,
  });
  
  const navigateToItem = (item) => {
    if (item.type === 'track') {
      router.push(`/track/${item.id}`);
    } else if (item.type === 'playlist') {
      router.push(`/playlist/${item.id}`);
    } else if (item.type === 'artist') {
      router.push(`/artist/${item.id}`);
    }
  };
  </script>
  
  <style scoped>
  .horizontal-section {
  background-color: #000;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 10px;
}

.section-title {
  font-size: 24px;
  margin-bottom: 15px;
  color: #fff;
}

.scroll-list {
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding: 10px 0;
  list-style: none;
  scroll-behavior: smooth;
}

.scroll-item {
  flex: 0 0 auto;
  width: 160px;
  color: #fff;
  text-align: center;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.scroll-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: #282828;
}

.item-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-image {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
  transition: transform 0.3s ease;
}

.scroll-item:hover .item-image {
  transform: scale(1.1);
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  transition: color 0.3s ease;
}

.scroll-item:hover .item-name {
  color: #1db954;
}

.item-sub {
  font-size: 12px;
  color: #b3b3b3;
}

.loading {
  color: #888;
}
  </style>