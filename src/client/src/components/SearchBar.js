import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// Lives in the NavBar. On submit it navigates to the results page with the
// query in the URL, so the search is shareable/bookmarkable and survives refresh.
export default function SearchBar() {
  const [term, setTerm] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const q = term.trim()
    if (!q) {
      inputRef.current.focus()
      return
    }
    navigate(`/search?query=${encodeURIComponent(q)}`)
  }

  return (
    <form className="flex-grow-1 mx-3" style={{ maxWidth: 480 }} onSubmit={handleSubmit} role="search">
      <input
        ref={inputRef}
        type="search"
        className="form-control form-control-sm"
        placeholder="Search restaurants or dishes…"
        value={term}
        onChange={e => setTerm(e.target.value)}
      />
    </form>
  )
}
