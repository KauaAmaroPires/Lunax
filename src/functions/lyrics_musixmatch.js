const fetch = require('isomorphic-fetch');
const cheerio = require('cheerio');
const htmlToText = require('html-to-text');
const { JSDOM } = require('jsdom');
const spotify = require('../structures/spotify.js');
const Spotify = new spotify();

module.exports = async ({ client: client, title: title }) => {

    const res = await Spotify.searchSpotify({ client: client, title: title });

    if (res.error) return {
        error: 'musica não encontrada'
    };

    let joinAuthor = [];

    let track = res.tracks.items[0];
    let author = track.artists.filter(x => x.type === 'artist');
    author.forEach(x => {
        joinAuthor.push(x.name);
    });
    joinAuthor = {
        authorURI: joinAuthor.join("-").split(" ").join("-"),
        author: joinAuthor.join("/")
    };
    author = author[0].name;
    let name = {
        track: track.name,
        URI: track.name.split(" ").join("-")
    };
    let image = track.album.images[0].url;

    //const url = `https://www.musixmatch.com/lyrics/${encodeURIComponent(author)}/${encodeURIComponent(name)}`;
    const response = {};

    const search = async (body) => {
        let content = [];
        const $ = cheerio.load(body, {
            xmlMode: true
        });
        $('.search-results .box-style-plain .box-content .tracks .showArtist').each((key, e) => {
            content.push({
                title: htmlToText.fromString($(e).find('.media-card-body .media-card-title .title').text()),
                artist: htmlToText.fromString($(e).find('.media-card-body .media-card-subtitle').text()),
                url: 'https://www.musixmatch.com' + htmlToText.fromString($(e).find('.media-card-body .media-card-title .title').attr('href')),
            })
        });
        return content;
    };

    const scrappe = async (url) => {
        const r = await fetch(url).then(res => res.text()).then(text => {

            const dom = new JSDOM(text);

            const list = (dom.window.document.querySelectorAll('.lyrics__content__ok'));

            if (!list.length) return {
                error: 'letra não encontrada.'
            };

            const lyrics = [];

            for (const lyric of list.values()) {
                lyrics.push(lyric.textContent);
            };

            if (lyrics.length === 0) return {
                error: 'letra não encontrada.'
            };

            if (lyrics[0].includes('s in the air')) return {
                error: 'letra não encontrada.'
            };

            response.title = name.track;
            response.author = joinAuthor.author;
            response.image = image;
            response.lyrics = lyrics.join('\n');

        });

        return r;
    };

    const Urls = [
        `https://www.musixmatch.com/pt-br/letras/${encodeURIComponent(joinAuthor.authorURI)}/${name.URI}`,
        `https://www.musixmatch.com/pt-br/search/${encodeURIComponent(name.URI)}/tracks`,
        `https://www.musixmatch.com/pt-br/search/${encodeURIComponent(name.URI)}/letras`,
        `https://www.musixmatch.com/pt-br/search/${encodeURIComponent(`${author} ${name.track}`)}/tracks`,
        `https://www.musixmatch.com/pt-br/search/${encodeURIComponent(`${author} ${name.track}`)}/letras`
    ];

    let body;
    let ResSearch = [];
    let i = 0;

    const Search = async (index) => {
        if (index == 0) {
            const res = await scrappe(Urls[index]);
            if (res?.error) {
                response.title = false;
                response.author = false;
                response.image = false;
                response.lyrics = false;
                ResSearch = [];
            } else {
                ResSearch = [
                    {
                        title: name.track,
                        artist: joinAuthor.author
                    }
                ];
            }
        } else {
            body = await fetch(Urls[index]).then(res => res.text());
            ResSearch = await search(body);
        }
        i++
    };

    await Search(0);

    for (; i < Urls.length;) {
        if (!ResSearch[0] || !ResSearch.filter(x => x.artist.toLowerCase().includes(author.toLowerCase()) && x.title.toLowerCase().includes(name.track.toLowerCase()))[0]) {
            await Search(i);
        } else i++;
    };

    if (i != 0) {
        if (!ResSearch[0] || !ResSearch.filter(x => x.artist.toLowerCase().includes(author.toLowerCase()) && x.title.toLowerCase().includes(name.track.toLowerCase()))[0]) return {
            error: 'musica não encontrada'
        };
        if (ResSearch.filter(x => x.artist.toLowerCase().includes(author.toLowerCase()) && x.title.toLowerCase().includes(name.track.toLowerCase()))[0].url) {
            await scrappe(ResSearch.filter(x => x.artist.toLowerCase().includes(author.toLowerCase()) && x.title.toLowerCase().includes(name.track.toLowerCase()))[0].url);
        };
    };  

    if (!response.title) return {
        error: 'musica não encontrada'
    };

    return response;

};