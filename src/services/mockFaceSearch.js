/**
 * Stand-in for the face-search API so the whole flow is clickable before the
 * real endpoint exists. Swapped out automatically once VITE_API_BASE_URL is set.
 */
const SAMPLE_SEEDS = [
  'pioneers-01', 'pioneers-02', 'pioneers-03', 'pioneers-04', 'pioneers-05',
  'pioneers-06', 'pioneers-07', 'pioneers-08', 'pioneers-09',
]

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))
      },
      { once: true },
    )
  })

export async function mockFaceSearch({ fullName, signal }) {
  await wait(2200, signal)

  const count = 3 + (fullName.trim().length % 6)

  return {
    requestId: `mock-${Date.now()}`,
    photos: SAMPLE_SEEDS.slice(0, count).map((seed, index) => ({
      id: seed,
      url: `https://picsum.photos/seed/${seed}/1200/1600`,
      thumbnailUrl: `https://picsum.photos/seed/${seed}/600/800`,
      takenAt: new Date(Date.now() - index * 36e5).toISOString(),
      score: Number((0.97 - index * 0.03).toFixed(2)),
    })),
  }
}
