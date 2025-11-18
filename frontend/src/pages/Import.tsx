import { useState } from 'react'
import { api } from '../services/api'

export function Import() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setResult(null)

    try {
      const csvContent = await file.text()
      const response = await api.post('/leads/import', { csvContent })
      setResult(response)
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Import Leads</h1>
        <p className="mt-2 text-gray-600">
          Upload a CSV file to bulk import leads
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">CSV Format</h2>
        <p className="text-sm text-gray-600 mb-4">
          Download the{' '}
          <a
            href="/docs/sample-leads-import.csv"
            className="text-blue-600 hover:underline"
            download
          >
            sample CSV file
          </a>{' '}
          to see the expected format.
        </p>

        <div className="bg-gray-50 p-4 rounded-md text-xs font-mono overflow-x-auto">
          <p className="mb-2">Required fields:</p>
          <ul className="list-disc ml-5 mb-4">
            <li>companyName</li>
            <li>contactName</li>
            <li>phone</li>
            <li>email</li>
          </ul>
          <p className="mb-2">Optional fields:</p>
          <ul className="list-disc ml-5">
            <li>contactTitle</li>
            <li>currentStage (default: INQUIRY)</li>
            <li>estimatedValue</li>
            <li>nextActionType (EMAIL, PHONE_CALL, MEETING)</li>
            <li>nextActionDescription</li>
            <li>nextFollowUpDate (YYYY-MM-DD format)</li>
            <li>leadSource (default: OTHER)</li>
            <li>notes</li>
          </ul>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Upload CSV</h2>

        <div className="mb-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={handleImport}
          disabled={!file || importing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importing ? 'Importing...' : 'Import Leads'}
        </button>

        {result && (
          <div className="mt-6">
            {result.error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-900 font-semibold">Import Failed</p>
                <p className="text-red-700 text-sm">{result.error}</p>
              </div>
            ) : (
              <>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                  <p className="text-green-900 font-semibold">
                    Import Complete
                  </p>
                  <p className="text-green-700 text-sm">
                    Successfully imported {result.imported} lead(s)
                  </p>
                  {result.failed > 0 && (
                    <p className="text-yellow-700 text-sm mt-1">
                      {result.failed} row(s) failed
                    </p>
                  )}
                </div>

                {result.failedRows && result.failedRows.length > 0 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                    <p className="text-yellow-900 font-semibold mb-2">
                      Failed Rows
                    </p>
                    {result.failedRows.map((fail: any, idx: number) => (
                      <div key={idx} className="text-sm mb-2">
                        <p className="font-semibold">Row {fail.row}:</p>
                        <p className="text-yellow-800">{fail.reason}</p>
                        <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(fail.data, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
