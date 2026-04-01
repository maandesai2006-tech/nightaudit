'use client'

import { useState, useRef } from 'react'
import { Upload, CheckCircle, AlertTriangle, FileText, Info } from 'lucide-react'

interface FileResult {
  fileName: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  message?: string
}

export default function UploadPage() {
  const [files, setFiles] = useState<FileResult[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (fileList: FileList) => {
    const newFiles: FileResult[] = Array.from(fileList).map(f => ({
      fileName: f.name,
      status: 'uploading' as const,
    }))
    setFiles(prev => [...prev, ...newFiles])

    // Simulate — in production this would POST to an API or process client-side
    newFiles.forEach((file, i) => {
      setTimeout(() => {
        setFiles(prev => prev.map(f =>
          f.fileName === file.fileName
            ? { ...f, status: 'done', message: 'Report queued for processing' }
            : f
        ))
      }, 800 + i * 400)
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text)] tracking-tight">
          Upload Reports
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wider">
          Manual report upload for IHG, Hilton, Choice, and Marriott
        </p>
      </div>

      {/* Info Banner */}
      <div className="card-static p-4 flex items-start gap-3">
        <Info size={16} className="text-[var(--info)] mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-[var(--text)]">Automated ingestion is active</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
            Reports for Holiday Inn Express Destin and Candlewood Suites are automatically pulled from email.
            Use this page for manual uploads or other properties.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        className={`upload-zone p-10 text-center ${dragging ? 'dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
        <div className="w-14 h-14 rounded-xl shadow-[var(--shadow-card)] bg-[var(--bg)] flex items-center justify-center mx-auto mb-4">
          <Upload size={24} className="text-[var(--accent)]" />
        </div>
        <p className="text-sm font-semibold text-[var(--text)] mb-1">Drop PDF files here</p>
        <p className="text-xs text-[var(--text-muted)]">or click to browse</p>
      </div>

      {/* Results */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            Results
          </h3>
          {files.map((file, i) => (
            <div key={`${file.fileName}-${i}`} className="card-static p-4 animate-fade-up">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  file.status === 'done' ? 'text-[var(--success)]' :
                  file.status === 'error' ? 'text-[var(--danger)]' :
                  'text-[var(--warning)]'
                }`} style={{ boxShadow: 'var(--shadow-subtle)' }}>
                  {file.status === 'done' ? <CheckCircle size={18} /> :
                   file.status === 'error' ? <AlertTriangle size={18} /> :
                   <FileText size={18} className="animate-pulse-soft" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[var(--text)] truncate">{file.fileName}</p>
                  {file.message && (
                    <p className="text-[0.65rem] text-[var(--text-faint)] mt-0.5">{file.message}</p>
                  )}
                  {file.status === 'uploading' && (
                    <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ boxShadow: 'var(--shadow-recessed)' }}>
                      <div className="h-full bg-[var(--warning)] rounded-full animate-pulse-soft" style={{ width: '60%' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
