import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Simple test component
function TestButton({ label }: { label: string }) {
  return <button>{label}</button>
}

describe('Sample Component Test', () => {
  it('should render a button with text', () => {
    render(<TestButton label="Click me" />)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('should handle props correctly', () => {
    const { rerender } = render(<TestButton label="First" />)
    expect(screen.getByText('First')).toBeInTheDocument()

    rerender(<TestButton label="Second" />)
    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})
