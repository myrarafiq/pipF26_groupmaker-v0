import { useEffect, useState } from 'react'

const FIELDS = {
  name: 'What is your name?',
  interests: 'What are your interests?',
}

export default function Survey({ onBack }) {
  const [students, setStudents] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [name, setName] = useState('')
  const [interests, setInterests] = useState('')
  const [missing, setMissing] = useState([])
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/roster')
      .then((res) => {
        if (!res.ok) throw new Error(`Backend responded ${res.status}`)
        return res.json()
      })
      .then((data) => setStudents(data.students))
      .catch((err) => setLoadError(err.message))
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    const missingFields = []
    if (!name) missingFields.push('name')
    if (!interests.trim()) missingFields.push('interests')
    if (missingFields.length) {
      setMissing(missingFields)
      setError(null)
      return
    }

    setMissing([])
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, interests: interests.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || `Backend responded ${res.status}`)
      }
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <h1>GroupMaker</h1>
      <p className="subtitle">Survey</p>
      <button type="button" className="text-link" onClick={onBack}>
        ← Back to roster
      </button>

      {submitted ? (
        <p className="confirmation">Thanks — your survey was submitted.</p>
      ) : loadError ? (
        <p className="error">
          Could not load the roster: {loadError}. Is <code>python app.py</code> running?
        </p>
      ) : (
        <form className="survey-form" onSubmit={handleSubmit} noValidate>
          {missing.length > 0 && (
            <p className="error">
              Please fill in: {missing.map((key) => FIELDS[key]).join(', ')}
            </p>
          )}
          {error && (
            <p className="error">Could not save your survey: {error}</p>
          )}

          <label className={missing.includes('name') ? 'field missing' : 'field'}>
            {FIELDS.name}
            <select value={name} onChange={(e) => setName(e.target.value)}>
              <option value="">Select your name</option>
              {students.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <label className={missing.includes('interests') ? 'field missing' : 'field'}>
            {FIELDS.interests}
            <textarea
              rows={4}
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            />
          </label>

          <button className="randomize" type="submit" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      )}
    </main>
  )
}
