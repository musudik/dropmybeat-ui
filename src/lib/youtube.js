const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * YouTube search result object structure:
 * {
 *   id: string,
 *   title: string,
 *   channelTitle: string,
 *   thumbnail: string,
 *   publishedAt: string
 * }
 */

export async function searchYouTube(query) {
  try {
    const response = await fetch(
      `${YOUTUBE_API_URL}/search?part=snippet&maxResults=5&q=${encodeURIComponent(
        query
      )}&type=video&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('YouTube API request failed');
    }

    const data = await response.json();
    
    return data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.default.url,
      publishedAt: item.snippet.publishedAt
    }));
  } catch (error) {
    console.error('Error searching YouTube:', error);
    throw error;
  }
}

export function getYouTubeVideoUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
