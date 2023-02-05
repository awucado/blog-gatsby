import path from "path"
import type { GatsbyConfig } from "gatsby"
import cheerio from "cheerio"

const fixRelativeLinks = (html: string, siteUrl: string) => {
  const $ = cheerio.load(html, {
    decodeEntities: false,
  })

  $("a[href], img[src]").each(function () {
    const href = $(this).attr("href")
    if (typeof href == "string" && !href.startsWith("http")) {
      $(this).attr("href", siteUrl + (href.startsWith("/") ? "" : "/") + href)
    }
    const src = $(this).attr("src")
    if (typeof src == "string" && !src.startsWith("http")) {
      $(this).attr("src", siteUrl + (src.startsWith("/") ? "" : "/") + src)
    }
  })

  return $.html()
}

const siteTitle = `Xetera`
const discordId = "140862798832861184"
const themeColor = `#112130`

const config: GatsbyConfig = {
  siteMetadata: {
    title: `Gatsby Starter Blog`,
    author: {
      name: `Kyle Mathews`,
      summary: `who lives and works in San Francisco building useful things.`,
    },
    description: `A starter blog demonstrating what Gatsby can do.`,
    siteUrl: `https://gatsbystarterblogsource.gatsbyjs.io/`,
    social: {
      twitter: `kylemathews`,
    },
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: "gatsby-plugin-root-import",
      options: {
        "@assets": path.join(__dirname, "content", "assets"),
        "@src": path.join(__dirname, "src"),
      },
    },

    `gatsby-plugin-catch-links`,
    `gatsby-plugin-image`,
    `gatsby-plugin-mdx`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `content`,
      },
    },

    "gatsby-plugin-twitter",
    "gatsby-remark-reading-time",
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-plugin-sharp`,
      options: {
        stripMetadata: true,
      },
    },
    "gatsby-plugin-postcss",
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: siteTitle,
        short_name: siteTitle,
        start_url: `/`,
        background_color: `#000000`,
        theme_color: themeColor,
        display: `minimal-ui`,
        icon: `content/assets/xetera.png`,
      },
    },
    "gatsby-plugin-open-graph-images",
    {
      resolve: "gatsby-plugin-webpack-bundle-analyser-v2",
      options: { devMode: process.env.ANALYZE === "true" },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMdx } }) => {
              return allMdx.edges.map(edge => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.description, // or excerpt
                  date: edge.node.frontmatter.date,
                  url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  enclosure: {
                    url:
                      site.siteMetadata.siteUrl +
                      edge.node.fields.slug +
                      "thumbnail.png",
                  },
                  custom_elements: [
                    {
                      "content:encoded": fixRelativeLinks(
                        edge.node.html,
                        site.siteMetadata.siteUrl
                      ),
                    },
                  ],
                })
              })
            },
            query: `{
              allMdx(
                sort: { fields: [frontmatter___date], order: DESC }
                filter: { frontmatter: { draft: { ne: true } } }
              ) {
                edges {
                  node {
                    html
                    fields { slug }
                    frontmatter {
                      title
                      date
                      description
                    }
                  }
                }
              }
            }`,
            output: "/rss.xml",
            title: "Xetera",
            // im not sure how to resolve site url automatically here
            image_url: "https://xetera.dev/favicon-32x32.png",
            feed_url: "https://xetera.dev/rss.xml",
            site_url: "https://xetera.dev",
          },
        ],
      },
    },
    "gatsby-plugin-netlify",
  ],
}
export default config
