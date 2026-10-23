/**
 * Editorial content for Sitware Shift and Shift Pro, from the approved homepage and product page
 * designs. Prices, stock and variants never live here: they come from the Medusa products with
 * the same handle (`shift`, `shift-pro`).
 *
 * Imagery illustrates the design direction; final product photography replaces it later.
 */
export type WorkstationHandle = "shift" | "shift-pro"

type Row = { k: string; v: string }
type GalleryImage = {
  src: string
  alt: string
  caption: string
  studio?: boolean
}

export type Workstation = {
  handle: WorkstationHandle
  name: string
  short: string
  badge: string
  kicker: string
  message: string
  description: string
  setup: string
  bestFor: string
  subtitle: string
  cutout: string
  photo: string
  gallery: GalleryImage[]
  details: Row[]
  moveTitle: string
  moveNote: string
  poses: { label: string; img: string }[]
  storyKicker: string
  storyTitle: string
  storyNote: string
  story: { k: string; v: string; img: string }[]
  compare: Row[]
}

const img = (name: string) => `/images/sitware/${name}.webp`

export const WORKSTATIONS: Record<WorkstationHandle, Workstation> = {
  shift: {
    handle: "shift",
    name: "Sitware Shift",
    short: "Shift",
    badge: "Everyday",
    kicker: "Single-level · Laptop-first",
    message: "Change your position. Not your desk.",
    description:
      "A compact, single-level workstation for flexible everyday work. It sits on the desk you already have and gives your laptop a place to move with you, from sitting to standing and back.",
    setup: "Laptop-first, compact",
    bestFor: "Home / hybrid work",
    subtitle: "Laptop-first",
    cutout: img("shift-cutout"),
    photo: img("shift"),
    gallery: [
      {
        src: img("shift-cutout"),
        alt: "Sitware Shift",
        caption: "Sitware Shift",
        studio: true,
      },
      {
        src: img("shift"),
        alt: "Shift with a laptop",
        caption: "A place for your laptop",
      },
      {
        src: img("home"),
        alt: "Shift in a home office",
        caption: "Home office",
      },
      {
        src: img("hybrid"),
        alt: "Shift in a living space",
        caption: "Hybrid work",
      },
    ],
    details: [
      { k: "For", v: "Flexible everyday work" },
      { k: "Setup", v: "A place for your laptop" },
      { k: "Best in", v: "Home / hybrid work" },
    ],
    moveTitle: "Upgrade the desk you already have.",
    moveNote:
      "Keep the desk you love. Add Shift, and it becomes more than one way to work.",
    poses: [
      { label: "Before", img: img("step1") },
      { label: "With Shift", img: img("step2") },
    ],
    storyKicker: "A day with Shift",
    storyTitle: "Your workday changes. Your workspace should too.",
    storyNote:
      "Sitting is not the enemy. Being stuck in one way of working is.",
    story: [
      { k: "10:00 AM", v: "Sitting — deep work", img: img("step1") },
      { k: "12:30 PM", v: "Call / quick task", img: img("home") },
      { k: "3:00 PM", v: "Raise the workstation", img: img("step2") },
      { k: "3:05 PM", v: "Keep working — standing", img: img("hybrid") },
    ],
    compare: [
      { k: "Format", v: "Single-level, laptop-first" },
      { k: "Role", v: "Accessible entry model" },
      { k: "Story", v: "Flexibility & simplicity" },
      { k: "Best for", v: "Home / hybrid work" },
    ],
  },
  "shift-pro": {
    handle: "shift-pro",
    name: "Sitware Shift Pro",
    short: "Shift Pro",
    badge: "Flagship",
    kicker: "Two-level · Monitor + keyboard",
    message: "Turn your desk into a workstation.",
    description:
      "A two-level workstation for people whose desk is where real work happens. Your monitor stays elevated, your keyboard and mouse live on their own level, and the whole setup changes position together.",
    setup: "Monitor + keyboard",
    bestFor: "Professional work",
    subtitle: "Monitor + keyboard",
    cutout: img("shift-pro-cutout"),
    photo: img("shiftpro"),
    gallery: [
      {
        src: img("shift-pro-cutout"),
        alt: "Sitware Shift Pro",
        caption: "Sitware Shift Pro",
        studio: true,
      },
      {
        src: img("shiftpro"),
        alt: "Shift Pro with monitor and keyboard",
        caption: "Monitor + keyboard",
      },
      {
        src: img("pros"),
        alt: "Shift Pro in a professional setup",
        caption: "Professionals",
      },
      {
        src: img("changed"),
        alt: "Shift Pro by a window",
        caption: "A complete workstation",
      },
    ],
    details: [
      { k: "For", v: "Complete workstations" },
      { k: "Setup", v: "Monitor + keyboard setups" },
      { k: "Storage", v: "Space for your essentials" },
      {
        k: "Built for",
        v: "Developers, designers, traders, founders, editors, architects and creators",
      },
    ],
    moveTitle: "Sit. Stand. Shift.",
    moveNote:
      "Monitor, keyboard and mouse rise together, so you can change position without changing your setup.",
    poses: [
      { label: "Sit", img: img("step3") },
      { label: "Stand", img: img("step4") },
    ],
    storyKicker: "Flagship",
    storyTitle: "Built for people whose desk is where real work happens.",
    storyNote: "A complete workstation upgrade, not a bigger converter.",
    story: [
      { k: "01", v: "Monitor stays elevated.", img: img("pros") },
      {
        k: "02",
        v: "Keyboard and mouse live on their own level.",
        img: img("shiftpro"),
      },
      {
        k: "03",
        v: "The whole setup changes position together.",
        img: img("step4"),
      },
      {
        k: "04",
        v: "Space to make, edit, and bring ideas to life.",
        img: img("creators"),
      },
    ],
    compare: [
      { k: "Format", v: "Two-level, monitor + keyboard" },
      { k: "Role", v: "Flagship / professional model" },
      { k: "Story", v: "Complete workspace transformation" },
      { k: "Best for", v: "Professional work" },
    ],
  },
}

export const WORKSTATION_ORDER: WorkstationHandle[] = ["shift", "shift-pro"]

export const isWorkstationHandle = (
  handle: string
): handle is WorkstationHandle => handle in WORKSTATIONS

// TODO(owner): replace each "To be confirmed" with the confirmed specification.
export const SPEC_LABELS = [
  "Dimensions",
  "Height range",
  "Load capacity",
  "Weight",
  "Finish",
]
