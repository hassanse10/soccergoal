import axios from 'axios'

export async function getWCNews() {
  const res = await axios.get('/api/news/everything', {
    params: {
      q: 'FIFA World Cup 2026',
      language: 'en',
      pageSize: 15,
      sortBy: 'publishedAt',
    },
  })
  return res.data.articles ?? []
}
