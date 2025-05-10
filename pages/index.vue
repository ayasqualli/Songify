<template>
  <div class="landing-page">
    <div class="navbar">
      <div class="logo-container">
        <img src="../assets/logo.png" alt="logo" />
      </div>
      <div class="navigation">
        <router-link to="/signin" class="nav-link">Sign-in</router-link>
        <router-link to="/signup" class="nav-link">Sign-up</router-link>
      </div>
    </div>

    <div class="hero-section">
      <h1>Music for everyone.</h1>
      <p>Millions of songs. Tune to your vibe.</p>
      <div class="cta-buttons">
        <router-link to="/signup" class="cta-button primary"
          >Get Songify for Free</router-link
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LandingPage",
};
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #000;
}

.navbar {
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  margin-right: auto;
  width: 40%;
}

.logo-container img {
  width: 200px;
  height: auto;
}

.navigation {
  display: flex;
  gap: 2rem;
  margin-right: 40px;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}

.nav-link {
  text-decoration: none;
  text-align: center;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: color 0.3s;
  font-weight: 600;
  font-size: 20px;
}

.nav-link:hover {
  color: #1db954;
}

.hero-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5));
  background-size: cover;
  background-position: center;
}

.hero-section h1 {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: white;
}

.hero-section p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #ffffff;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
}

.cta-button {
  padding: 1rem 2.5rem;
  border-radius: 500px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s;
  font-size: 1.1rem;
}

.cta-button.primary {
  background-color: #1ed760;
  color: black;
}

.cta-button:hover {
  transform: scale(1.05);
}
</style>
