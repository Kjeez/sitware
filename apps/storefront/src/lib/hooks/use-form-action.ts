"use client"

import { FormEvent, startTransition, useActionState } from "react"

/**
 * Like `useActionState`, but submits through `onSubmit` so React doesn't reset the form after the
 * action runs. Visitors keep what they typed when the server returns an error.
 */
export function useFormAction<State>(
  action: (state: Awaited<State>, formData: FormData) => State | Promise<State>,
  initialState: Awaited<State>
) {
  const [state, dispatch, pending] = useActionState(action, initialState)
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(() => dispatch(formData))
  }
  return [state, onSubmit, pending] as const
}
