const { request } = require('undici');

class Spotify {
    constructor() {
        this.client = '';
        this.auth = ''
        this.token = {};
        this.renewDate = 0;
    }

    async searchSpotify({ client: client, title: title }) {

        if (!this.token.token || this.renewDate === 0 || Date.now() > this.renewDate) {
            if (!this.token.token) {
                this.client = client;
                this.auth = Buffer.from(`${this.client.config.lunaxClientSpotifyId}:${this.client.config.lunaxClientSpotifySecret}`).toString('base64');
            }
            await this.renewToken();
        };

        const res = await request(`https://api.spotify.com/v1/search?q=${encodeURIComponent(title)}&type=track&limit=1&access_token=${this.token.token}`).then(e => e.body.json()).catch(e => {});

        if (!res || !res.tracks.items[0]) return {
            error: 'not found'
        };

        return res;

    };

    async renewToken() {
        if (this.auth) {
            await this.getToken();
        }
    };

    async getToken() {
        const res = await request('https://accounts.spotify.com/api/token?grant_type=client_credentials', {
            method: 'POST',
            headers: {
              Authorization: `Basic ${this.auth}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(e => e.body.json()).catch(e => {});
        this.token = {
            token: res.access_token,
            type: res.token_type
        };
        this.renewDate = Date.now() + res.expires_in * 1000 - 5000;
    };
};

module.exports = Spotify;
  