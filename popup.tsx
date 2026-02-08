import { Toaster } from "sonner"
import "styles/globals.css"
import { Settings } from "./settings"

function IndexPopup() {
  return (
    <div
      style={{
        padding: 16
      }}>
      <Settings />
      <Toaster />
    </div>
  )
}

export default IndexPopup
