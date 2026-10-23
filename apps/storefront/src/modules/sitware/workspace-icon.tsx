import type { ReactNode } from "react"

type IconName = "laptop" | "monitor" | "space" | "home" | "layers" | "briefcase" | "focus" | "flow" | "box" | "search" | "user" | "cart"

export function WorkspaceIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    laptop: <><rect x="5" y="5" width="22" height="17" rx="1" /><path d="M2 26h28l-3-4H5z" /></>,
    monitor: <><rect x="3" y="4" width="26" height="19" rx="1" /><path d="M16 23v5m-6 0h12" /></>,
    space: <><path d="M11 4H4v7m17-7h7v7M4 21v7h7m17-7v7h-7" /><path d="M12 12h8v8h-8z" /></>,
    home: <><path d="m3 15 13-11 13 11M7 12v16h7v-8h5v8h7V12" /></>,
    layers: <><path d="m16 3 13 7-13 7-13-7zM3 16l13 7 13-7M3 22l13 7 13-7" /></>,
    briefcase: <><rect x="3" y="9" width="26" height="19" rx="2" /><path d="M11 9V5h10v4M3 17h26m-15-2h4v5h-4z" /></>,
    focus: <><circle cx="16" cy="16" r="13" /><path d="M12 7c5 0 6 4 6 7l2 4-3 1v3h-4l-1 6m10-16 3-2m-2 7h4m-5 4 3 2" /></>,
    flow: <><path d="M10 5v24m-5-5 5 5 5-5M22 27V3m-5 5 5-5 5 5" /></>,
    box: <><path d="m16 2 13 8v14l-13 8L3 24V10zM3 10l13 8 13-8M16 18v14m5-11 5-3" /></>,
    search: <><circle cx="14" cy="14" r="10" /><path d="m22 22 8 8" /></>,
    user: <><circle cx="16" cy="9" r="5" /><path d="M4 29c0-8 5-12 12-12s12 4 12 12z" /></>,
    cart: <><path d="M2 4h4l5 18h15l4-14H7" /><circle cx="12" cy="27" r="1.5" /><circle cx="25" cy="27" r="1.5" /></>,
  }
  return <svg viewBox="0 0 32 34" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
