import axios from 'axios';

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

export async function fetchUnsplashImage(query, fallback = '/images/placeholder.jpg') {
    if (!ACCESS_KEY) return fallback;
    try {
        const response = await axios.get('https://api.unsplash.com/search/photos', {
            params: {
                query,
                per_page: 1,
                orientation: 'squarish',
                client_id: ACCESS_KEY
            }
        });
        return response.data.results?.[0]?.urls?.small || fallback;
    } catch {
        return fallback;
    }
}

export async function fetchUnsplashImages(query, count, fallback = '/images/placeholder.jpg') {
    if (!ACCESS_KEY) return Array(count).fill({ urls: { small: fallback } });
    try {
        const response = await axios.get('https://api.unsplash.com/search/photos', {
            params: {
                query,
                per_page: count,
                orientation: 'squarish',
                client_id: ACCESS_KEY
            }
        });
        return response.data.results.length
            ? response.data.results
            : Array(count).fill({ urls: { small: fallback } });
    } catch {
        return Array(count).fill({ urls: { small: fallback } });
    }
}