/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

import "dotenv/config";
import path from "path";
import { createFilePath } from "gatsby-source-filesystem";
import { GatsbyNode } from "gatsby"
import { getAnilist, getSpotifyTracks } from "./fetcher"

// Define the template for blog post
const blogPost = path.resolve(`./src/templates/blog-post.js`)

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
export const createPages: GatsbyNode["createPages"] = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  // Get all markdown blog posts sorted by date
  const result = await graphql(`
    {
      allMarkdownRemark(sort: { frontmatter: { date: ASC } }, limit: 1000) {
        nodes {
          id
          fields {
            slug
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your blog posts`,
      result.errors
    )
    return
  }

  const posts = result.data.allMarkdownRemark.nodes

  // Create blog posts pages
  // But only if there's at least one markdown file found at "content/blog" (defined in gatsby-config.js)
  // `context` is available in the template as a prop and as a variable in GraphQL

  if (posts.length > 0) {
    posts.forEach((post, index) => {
      const previousPostId = index === 0 ? null : posts[index - 1].id
      const nextPostId = index === posts.length - 1 ? null : posts[index + 1].id

      createPage({
        path: post.fields.slug,
        component: blogPost,
        context: {
          id: post.id,
          previousPostId,
          nextPostId,
        },
      })
    })
  }
}

export const onCreateNode: GatsbyNode["onCreateNode"] = ({
  node,
  actions,
  getNode,
}) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })

    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}


export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = ({ actions }) => {
  const { createTypes } = actions

  // Explicitly define the siteMetadata {} object
  // This way those will always be defined even if removed from gatsby-config.js

  // Also explicitly define the Markdown frontmatter
  // This way the "MarkdownRemark" queries will return `null` even when no
  // blog posts are stored inside "content/blog" instead of returning an error
  createTypes(`
    type SiteSiteMetadata {
      author: Author
      siteUrl: String
      social: Social
    }

    type Author {
      name: String
      summary: String
    }

    type Social {
      twitter: String
    }

    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
      fields: Fields
    }

    type Frontmatter {
      title: String
      description: String
      date: Date @dateformat
    }

    type Fields {
      slug: String
    }
  `)
}

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