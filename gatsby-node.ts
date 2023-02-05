import "dotenv/config"
import path from "path"
import { createFilePath } from "gatsby-source-filesystem"
import { createOpenGraphImage } from "gatsby-plugin-open-graph-images"
import { postPreviewDimensions } from "./src/shared"
import { getAnilist, getSpotifyTracks } from "./fetcher"
import { GatsbyNode } from "gatsby"

const blogPostPreview = path.resolve(
  "./src/templates/preview.jsx"
)
console.log(blogPostPreview)
const staticPagePreview = path.resolve(
  "./src/templates/static-preview.jsx"
)

export const sourceNodes: GatsbyNode["sourceNodes"] = async ({
  actions,
  createNodeId,
  createContentDigest,
}) => {
  const [anilist, { tracks, likedTracks }] = await Promise.all([
    getAnilist(),
    getSpotifyTracks(),
  ])
  actions.createNode({
    ...anilist,
    id: createNodeId("user-information-anilist"),
    internal: {
      type: "Anilist",
      contentDigest: createContentDigest(anilist),
    },
  })
  if (tracks && likedTracks) {
    const spotifyTopTracksId = createNodeId(
      "user-information-spotify-top-tracks"
    )
    actions.createNode({
      tracks: tracks,
      id: spotifyTopTracksId,
      internal: {
        type: "SpotifyTopTracks",
        contentDigest: createContentDigest(tracks),
      },
    })

    const spotifyLikedTracksId = createNodeId(
      "user-information-spotify-liked-tracks"
    )
    actions.createNode({
      tracks: likedTracks,
      id: spotifyLikedTracksId,
      internal: {
        type: "SpotifyLikedTracks",
        contentDigest: createContentDigest(likedTracks),
      },
    })
  }
}

const staticPreviewMapping: Record<
  string,
  () => { title: string; description: string }
> = {
  "/": () => ({
    title: "It's me Xetera.",
    description: "I'm a developer I guess",
  }),
}

export const onCreatePage: GatsbyNode["onCreatePage"] = async props => {
  const { actions, page } = props
  const fetcher = staticPreviewMapping[page.path]
  if (fetcher) {
    const { title, description } = fetcher()
    const newPage = { ...page }
    const previewPath = `${page.path.replace(/\/{1,}/g, "/")}thumbnail.png`
    actions.deletePage(page)
    actions.createPage({
      ...newPage,
      context: {
        ...newPage.context,
        // ogImage: createOpenGraphImage(actions.createPage, {
        //   path: previewPath,
        //   component: staticPagePreview,
        //   size: postPreviewDimensions,
        //   context: {
        //     title,
        //     description,
        //   },
        // }),
      },
    })
  }
}

export const createPages: GatsbyNode["createPages"] = async ({
  graphql,
  actions,
}) => {
  const { createPage } = actions

  const blogPost = path.resolve(
     "./src/templates/post.jsx"
  )
  const result = await graphql(
    `
      {
        allMdx(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              id
              fields {
                slug
              }
              frontmatter {
                draft
                title
              }
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    throw result.errors
  }

  // Create blog posts pages.
  const posts = result.data.allMdx.edges

  // sometimes there are drafts that we don't want to display
  // so the next post needs to be one that isn't a draft
  const findNonDraft = nodes =>
    nodes.find(node => !node.node.frontmatter.draft)?.node ?? null

  posts.forEach(async (post, index) => {
    const previousNodes = posts.slice(index + 1)

    const previous = findNonDraft(previousNodes)
    const nextNodes = posts.slice(0, index)
    const next = findNonDraft(nextNodes.reverse())

    const { slug } = post.node.fields
    const context = {
      slug,
      previous,
      next,
    }

    const previewPath = `/${slug.replace(/\//g, "")}/thumbnail.png`

    console.log(post)
    createPage({
      path: slug,
      component: blogPost,
      context: {
        ...context,
        id: post.node.id,
        slug,
        // ogImage: createOpenGraphImage(createPage, {
        //   path: previewPath,
        //   component: blogPostPreview,
        //   size: postPreviewDimensions,
        //   context,
        // }),
      },
    })
  })
}

export const onCreateNode: GatsbyNode["onCreateNode"] = ({
  node,
  actions,
  getNode,
}) => {
  const { createNodeField } = actions
  console.log(node.internal.type)
  if (node.internal.type === `Mdx`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  actions,
}) => {
  actions.setWebpackConfig({
    resolve: {
      modules: [path.resolve(__dirname, "src"), "node_modules"],
    },
  })
}
