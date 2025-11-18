/**
 * NarrowScreenLayout Component
 * Responsive layout for 400-600px width (EDIprod side-by-side support)
 */

import { ReactNode } from 'react'

interface NarrowScreenLayoutProps {
  children: ReactNode
}

export function NarrowScreenLayout({ children }: NarrowScreenLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">LeadOff CRM</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="narrow-screen-container">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-3xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          LeadOff CRM - Lead Management System
        </div>
      </footer>
    </div>
  )
}

export default NarrowScreenLayout
