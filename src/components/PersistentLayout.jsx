import React, { Suspense, useMemo, useState } from "react"
import { useMount } from "react-use"
import Navbar from "./Navbar"

const PersistentLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export default React.memo(PersistentLayout)
