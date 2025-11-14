import { Stage } from '@leadoff/types'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="card max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-700 mb-4">
          LeadOff CRM
        </h1>
        <p className="text-gray-600 mb-4">
          Welcome to LeadOff - Your lead management system
        </p>
        <div className="flex gap-2">
          <button className="btn-primary">Primary Button</button>
          <button className="btn-secondary">Secondary Button</button>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <p>Available stages: {Object.keys(Stage).join(', ')}</p>
        </div>
      </div>
    </div>
  )
}

export default App
