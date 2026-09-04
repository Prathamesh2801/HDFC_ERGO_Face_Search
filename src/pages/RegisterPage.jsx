import { useEffect, useMemo, useState } from 'react'
import { useEventNavigate } from '@/routes/useEventNavigate'

import { SelfieField } from '@/components/form/SelfieField'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { TrashIcon, UserIcon } from '@/components/ui/Icons'
import { copy } from '@/config/brand'
import { useSearch } from '@/store/searchContext'
import { validateImage } from '@/utils/file'

export default function RegisterPage() {
  const navigate = useEventNavigate()
  const { startSearch, reset, forgetMe, remembered, eventId } = useSearch()

  const [fullName, setFullName] = useState(() => remembered?.fullName ?? '')
  const [selfie, setSelfie] = useState(null)
  const [errors, setErrors] = useState({})

  // A local preview URL so the field can show the shot before we submit it.
  const previewUrl = useMemo(() => (selfie ? URL.createObjectURL(selfie) : null), [selfie])
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl])

  // Returning here from results/searching starts a clean run.
  //
  // This must NOT be an unmount cleanup: submitting navigates away, which would
  // unmount this page and abort the request that was just fired. Clearing on
  // mount gives the same fresh form without touching an in-flight search.
  useEffect(() => {
    reset()
    // Intentionally mount-only — `reset` is stable, and re-running on every
    // change would wipe the search the user just started.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = (event) => {
    // Stop the native submit before anything else can throw, so a failure here
    // can never turn into a full page reload.
    event.preventDefault()
    event.stopPropagation()

    const nextErrors = {
      fullName: fullName.trim().length < 2 ? 'Please enter your full name.' : null,
      selfie: validateImage(selfie),
    }
    setErrors(nextErrors)
    if (nextErrors.fullName || nextErrors.selfie) return

    // startSearch owns its own error handling; catch here purely so the promise
    // is never left floating as an unhandled rejection.
    Promise.resolve(startSearch({ fullName, selfie })).catch(() => {})
    navigate('/searching')
  }

  const handleForget = () => {
    forgetMe()
    setFullName('')
    setSelfie(null)
    setErrors({})
  }

  return (
    <div className="flex flex-1 animate-fade-up flex-col">
      <section className="pt-2 text-center">
        <h1 className="text-3xl leading-tight font-bold tracking-tight text-brand-600 uppercase sm:text-4xl">
          {copy.register.title}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-600 sm:text-lg">
          {copy.register.subtitle}
        </p>
        <p className="mt-3 text-base font-medium text-ink-500 sm:text-lg">{copy.register.note}</p>
      </section>

      {/* Missing event id means the QR/link was incomplete — the search will fail. */}
      {!eventId && (
        <Alert className="mt-6">
          This link is missing its event code. Please scan the event QR code again.
        </Alert>
      )}

      {remembered && (
        <section className="mt-6 flex items-center gap-3 rounded-card bg-white/80 px-4 py-3 ring-1 ring-cream-300">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
            <UserIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink-900">
              Welcome back, {remembered.fullName.split(' ')[0]}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-400">
              Take a fresh selfie to pick up newly uploaded photos.
            </p>
          </div>
          <button
            type="button"
            onClick={handleForget}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-ink-500 transition hover:bg-cream-200 hover:text-brand-700"
          >
            <TrashIcon className="size-3.5" /> Clear
          </button>
        </section>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6 sm:mt-10">
        <TextField
          label="Full Name"
          name="fullName"
          autoComplete="name"
          enterKeyHint="done"
          placeholder="e.g. Ananya Sharma"
          value={fullName}
          onChange={(event) => {
            setFullName(event.target.value)
            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }))
          }}
          error={errors.fullName}
        />

        <SelfieField
          label="Upload Headshot/Selfie"
          value={selfie}
          previewUrl={previewUrl}
          error={errors.selfie}
          onChange={(file) => {
            setSelfie(file)
            setErrors((prev) => ({ ...prev, selfie: null }))
          }}
        />

        <div className="pt-2 text-center">
          <Button type="submit" className="min-w-56 text-lg uppercase">
            {copy.register.submit}
          </Button>
        </div>
      </form>
    </div>
  )
}
