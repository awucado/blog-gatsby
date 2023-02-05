import React, { useContext } from "react"
import { Link } from "gatsby"
import { Box, Flex } from "@chakra-ui/layout"
import { RiMoonLine, RiSunFoggyLine } from "react-icons/ri"
import { transition } from "../data/theme"
import { ThemeProvider } from "../data/providers"
import Headroom from "react-headroom"
import { StaticImage } from "gatsby-plugin-image"

const colors = {
  online: "hsl(139, 47.3%, 43.9%)",
  idle: "hsl(38, 95.7%, 54.1%)",
  offline: "hsl(214, 9.9%, 50.4%)",
  dnd: "hsl(359, 82.6%, 59.4%)",
}

export default function Navbar() {
  const { theme, setTheme, toggle } = useContext(ThemeProvider)

  const nav = (
    <>
      <Flex
        as="nav"
        justifyContent="space-between"
        width="100%"
        transition={transition}
        p={3}
        backdropFilter={{ base: "blur(8px); opacity(0.1)", xl: "none" }}
        zIndex={100}
      >
        <Flex justify="flex-start" align="center">
          <Link to="/" aria-label="Go back home">
            <Flex
              pointerEvents="all"
              alignItems="center"
              transition={transition}
            >
              <Flex
                w={["30px", "32px", "50px"]}
                h={["30px", "32px", "50px"]}
                justifyContent="center"
              >
                <Box
                  position="relative"
                  w="full"
                  transition="all 0.2s ease-in-out"
                  _hover={{
                    transform: "scale3d(1.1, 1.1, 1.1)",
                  }}
                >
                  <StaticImage
                    src="../../content/assets/xetera.png"
                    quality={100}
                    height={70}
                    width={72}
                  />
                </Box>
              </Flex>
            </Flex>
          </Link>
        </Flex>
        <Box
          p={2}
          color="text.100"
          onClick={() => setTheme(toggle)}
          cursor="pointer"
          as="button"
          pointerEvents="all"
          aria-label="theme switch"
        >
          {theme === "light" ? (
            <RiMoonLine size={30} />
          ) : (
            <RiSunFoggyLine size={30} />
          )}
        </Box>
      </Flex>
    </>
  )
  return <Headroom>{nav}</Headroom>
}
