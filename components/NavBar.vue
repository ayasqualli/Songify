<template>
    <div class="search-container">
        <div class="search-box" ref="searchBoxRef">
            <i class="fas fa-search"></i>
            <input 
                type="text" 
                placeholder="What do you want to play?"
                v-model="searchQuery"
                @input="handleSearch"
                @focus="showSearchResults = true"
            />
            <button v-if="searchQuery" class="clear-search-btn" @click="clearSearch">
                <i class="fas fa-times"></i>
            </button>
            
            <SearchResults 
                v-if="showSearchResults && searchResults && searchQuery" 
                :results="searchResults" 
                :searchQuery="searchQuery"
                :onClose="() => showSearchResults = false"
            />
        </div>
    </div>
</template>
  
<script setup>
import { useSearch } from '../composables/useSearch';
import { ref, onMounted, onUnmounted } from 'vue';
import SearchResults from './SearchResults.vue';

const { search, clearSearch: resetSearch, searchResults } = useSearch();

const searchQuery = ref('');
const showSearchResults = ref(false);
const searchBoxRef = ref(null);
const searchDebounceTimer = ref(null);

const handleSearch = () => {
  console.log('Search Query:', searchQuery.value);
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value);
  }
  
  searchDebounceTimer.value = setTimeout(async () => {
    if (searchQuery.value.trim()) {
      console.log('Triggering search...');
      await search(searchQuery.value, ['track', 'album', 'artist']);
      showSearchResults.value = true;
    } else {
      resetSearch();
      showSearchResults.value = false;
    }
  }, 300);
};

const clearSearch = () => {
  searchQuery.value = '';
  resetSearch();
  showSearchResults.value = false;
};

const handleClickOutside = (event) => {
  if (searchBoxRef.value && !searchBoxRef.value.contains(event.target)) {
    showSearchResults.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value);
  }
});
</script>

<style scoped>
.search-container {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 20px;
}

.search-box {
    position: relative;
    display: flex;
    align-items: center;
    background: #1c1c1c;
    border-radius: 40px;
    padding: 0 20px;
    width: 100%;
    max-width: 800px;
    height: 50px;
    color: gray;
}
  
.search-box input {
    background: transparent;
    width: 100px;
    height: 60px;
    border: none;
    outline: none;
    color: white;
    margin: 0 15px;
    flex: 1;
    font-size: 16px;
}

.clear-search-btn {
    background: transparent;
    border: none;
    color: gray;
    cursor: pointer;
    padding: 8px;
    font-size: 18px;
}

.clear-search-btn:hover {
    color: white;
}
</style>