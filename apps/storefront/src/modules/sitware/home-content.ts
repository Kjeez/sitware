// Homepage copy and imagery from the approved Home v3 design.

const img = (name: string) => `/images/sitware/${name}.webp`

export const STEPS = [
  { num: "01", title: "Your existing desk", img: img("step1") },
  { num: "02", title: "Add Sitware", img: img("step2") },
  { num: "03", title: "Work sitting", img: img("step3") },
  { num: "04", title: "Work standing", img: img("step4") },
]

export const SCENES = [
  {
    title: "Home Office",
    text: "A calmer place for your everyday work.",
    img: img("home"),
  },
  {
    title: "Creators",
    text: "Space to make, edit, and bring ideas to life.",
    img: img("creators"),
  },
  {
    title: "Professionals",
    text: "A thoughtful setting for focused work.",
    img: img("pros"),
  },
  {
    title: "Hybrid Work",
    text: "A space that feels like your own, wherever you work.",
    img: img("hybrid"),
  },
]

export const BENEFITS = [
  {
    num: "01",
    title: "Better Focus",
    text: "A workspace that asks for less attention.",
  },
  {
    num: "02",
    title: "Better Flow",
    text: "Make room to move between sitting and standing through your day.",
  },
  {
    num: "03",
    title: "Better Organization",
    text: "A more thoughtful place for the way you work.",
  },
]

// Also published as FAQPage structured data on the homepage.
export const FAQS = [
  {
    q: "What is Sitware?",
    a: "Sitware is a design-led workspace brand. We create thoughtful products that make the desk you already have more flexible, organized and intentional.",
  },
  {
    q: "Which workstations are in the collection?",
    a: "Two: Sitware Shift, a single-level, laptop-first workstation, and Sitware Shift Pro, a two-level workstation for a monitor and keyboard.",
  },
  {
    q: "Where can I find delivery and returns information?",
    a: "Delivery and returns details will be shared with the collection launch on our Shipping and Returns pages.",
    links: [
      { href: "/shipping", label: "Shipping" },
      { href: "/returns", label: "Returns" },
    ],
  },
]
