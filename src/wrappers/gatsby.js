import React from "react"
import { StyleManager } from "./chakra"

export const wrapRootElement = ({ element }) => {
  return (
    <StyleManager>
      {element}
    </StyleManager>
  )
}
