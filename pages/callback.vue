<template>
  <div>
    <p>Chargement...</p>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { onMounted } from "vue";

const router = useRouter();

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (!code) {
    console.error("Code d'autorisation manquant dans l'URL.");
    return;
  }

  try {
    const response = await fetch("/api/spotify/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Échec de la récupération du token : ${error}`);
    }

    const { access_token } = await response.json();

    // Store the access token in localStorage
    localStorage.setItem("access_token", access_token);

    const profileResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!profileResponse.ok) {
      const error = await profileResponse.text();
      throw new Error(`Échec de la récupération du profil : ${error}`);
    }

    const profile = await profileResponse.json();

    // Stocker les données du profil dans le stockage local
    localStorage.setItem("spotify_profile", JSON.stringify(profile));

    // Nettoyer l'URL pour supprimer le code
    window.history.replaceState({}, document.title, "/Home");

    // Rediriger vers la page d'accueil
    console.log("Redirecting to /Home");
    router.push("/Home");
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    if (error.code === "ECONNRESET") {
      console.error("La connexion a été réinitialisée. Veuillez réessayer.");
    }
    // Optionally, you can redirect to an error page or display a user-friendly message
  }
});
</script>
