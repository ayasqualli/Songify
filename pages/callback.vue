<template>
    <div>
        <p>Loading...</p>
    </div>
</template>

<script>
import { getAccessToken, fetchProfile } from '../script.js';

export default {
    async mounted() {
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
            const accessToken = await getAccessToken(clientId, code);
            const profile = await fetchProfile(accessToken);
            // Store profile data in Vuex or local storage
            this.$router.push('/Home'); // Redirect to home or profile page
        }
    }
};
</script>
