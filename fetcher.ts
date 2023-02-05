import fetch from "node-fetch"

const userAgent = "Gatsby worker (https://xetera.dev)"
const { SPOTIFY_REFRESH_TOKEN, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } =
  process.env

const authorization = Buffer.from(
  `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
).toString("base64")

/**
 * Forgive me lord for I have sinned in this function
 */
export async function getSpotifyTracks() {
  // forced to always get a new token because the spotify API is really nice and intuitive :)
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    // this is hardcoded because I did the flow manually and spotify sucks and needs oauth
    // for something that should be doable through client credentials...
    redirect_uri: "https://localhost:40751/.netlify/functions/spotify",
    scope: "user-read-email user-read-private user-top-read user-library-read",
    refresh_token: SPOTIFY_REFRESH_TOKEN!,
  })

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: `Basic ${authorization}`,
    },
    body: params.toString(),
  })

  const body = await response.json()
  if (!response.ok) {
    console.log("Spotify fetcher response was not ok", response.status)
    console.log(body)
    return
  }

  if (!body) {
    return
  }
  const token = body.access_token
  const tracks = await fetch(
    "https://api.spotify.com/v1/me/top/tracks?time_range=short_term",
    {
      headers: { authorization: `Bearer ${token}` },
    }
  ).then(res => res.json())

  const likedTracks = await fetch("https://api.spotify.com/v1/me/tracks", {
    headers: { authorization: `Bearer ${token}` },
  }).then(res => res.json())

  return { tracks, likedTracks }
}

export async function getAnilist() {
  const response = await fetch("https://graphql.anilist.co/", {
    method: "POST",
    headers: {
      "User-Agent": userAgent,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
       query UserQuery {
        mangaList: MediaListCollection(userName: "theonlylevelupper28", type:MANGA, status_not_in:[PLANNING, DROPPED, REPEATING, PAUSED]) {
          lists {
            name
            entries {
              updatedAt
              progress
              media {
                id
                description
                startDate {
                  year
                }
                coverImage {
                  large
                }
                title {
                  english
                }
              }
            }
          }
        }
      }
      `,
    }),
  })
  const { data } = await response.json()
  return data
}
