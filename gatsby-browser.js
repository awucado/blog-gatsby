import "typeface-sriracha"
import "./static/fonts/wotfard/stylesheet.css"
import Prism from "prism-react-renderer/prism"
import { wrapRootElement } from "./src/wrappers/gatsby"
;(typeof global !== "undefined" ? global : window).Prism = Prism

require("prismjs/components/prism-lua")

export { wrapRootElement }


