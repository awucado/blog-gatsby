import React from "react"
import { StyleManager } from "./chakra"
import PersistentLayout from "../components/PersistentLayout"
export const wrapRootElement = ({ element }) => {
  return (
    <StyleManager>
      <PersistentLayout>{element}</PersistentLayout>
    </StyleManager>
  )
}
