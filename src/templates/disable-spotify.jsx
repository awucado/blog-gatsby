import React from "react"

export const DisableNavbar = () => (
  <div
    dangerouslySetInnerHTML={{
      __html:
        "<style>nav, .headroom-wrapper { display: none !important }</style>",
    }}
  />
)
