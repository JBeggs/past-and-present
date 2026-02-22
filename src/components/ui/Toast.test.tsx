import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ToastComponent from './Toast'

describe('ToastComponent', () => {
  it('renders message and type', () => {
    const onClose = vi.fn()
    render(
      <ToastComponent
        toast={{ id: '1', message: 'Test message', type: 'success' }}
        onClose={onClose}
      />
    )
    expect(screen.getByText('Test message')).toBeInTheDocument()
    expect(document.querySelector('[data-cy="toast-success"]')).toBeTruthy()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <ToastComponent
        toast={{ id: '2', message: 'Close me', type: 'error' }}
        onClose={onClose}
      />
    )
    const closeBtn = document.querySelector('button')
    expect(closeBtn).toBeInTheDocument()
    fireEvent.click(closeBtn!)
    expect(onClose).toHaveBeenCalledWith('2')
  })

  it('renders all toast types', () => {
    const types = ['success', 'error', 'warning', 'info'] as const
    types.forEach((type) => {
      const { unmount } = render(
        <ToastComponent
          toast={{ id: type, message: type, type }}
          onClose={() => {}}
        />
      )
      expect(screen.getByText(type)).toBeInTheDocument()
      unmount()
    })
  })
})
