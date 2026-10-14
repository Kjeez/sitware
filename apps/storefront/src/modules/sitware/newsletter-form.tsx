"use client"

import { FormEvent, useState } from "react"

export default function NewsletterForm() {
  const [message, setMessage] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("Newsletter signups will open soon.")
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="newsletter-email">Email address</label>
        <input id="newsletter-email" type="email" placeholder="Your email address" required />
        <button aria-label="Join newsletter">↗</button>
      </form>
      {message && <small aria-live="polite">{message}</small>}
    </>
  )
}
