import * as React from "react"
import { Link } from "gatsby"
import { forwardRef } from "@chakra-ui/system"
import { Stack } from "@chakra-ui/layout"

export const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  let header

  if (isRootPath) {
    header = (
      <h1 className="main-heading">
        <Link to="/">{title}</Link>
      </h1>
    )
  } else {
    header = (
      <Link className="header-link-home" to="/">
        {title}
      </Link>
    )
  }

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">{header}</header>
      <main>{children}</main>
      <footer>
        © {new Date().getFullYear()}, Built with
        {` `}
        <a href="https://www.gatsbyjs.com">Gatsby</a>
      </footer>
    </div>
  )
}


export const StackedSection = forwardRef(({ children, ...rest }, ref) => {
  return (
    <Stack
      as="section"
      flexFlow="column"
      spacing={6}
      width="100%"
      maxWidth="72rem"
      ref={ref}
      {...rest}
    >
      {children}
    </Stack>
  )
})