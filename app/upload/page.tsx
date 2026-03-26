'use client'

import { useState, useRef } from 'react'
import { Upload, CheckCircle, AlertTriangle, FileText } from 'lucide-react'
import BrandBadge from '@/components/ui/BrandBadge'
import { MOCK_UPLOAD_RESULTS } from '@/lib/mock/data'

interface FileResult {
  fileName: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  result?: typeof MOCK_UPLOAD_RESULTS[0]
}

export default function UploadPage() {
  const [files, setFiles] = useState<FileResult[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (fileList: FileList) => {
    const newFiles: FileResult[] = Array.from(fileList).map((f, i) => ({
      fileName: f.name,
      status: 'uploading' as const,
    }))
    setFiles(prev => [...prev, ...newFiles])

    // Simulate upload with mock results
    newFiles.forEach((file, i) => {
      setTimeout(() => {
        setFiles(prev => prev.map(f =>
          f.fileName === file.fileName
            ? { ...f, status: 'done', result: MOCK_UPLOAD_RESULTS[i % MOCK_UPLOAD_RESULTS.length] }
            : f
        ))
      }, 1000 + i * 500)
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#2d3436] tracking-tight" style={{ textShadow: '0 1px 0 #fff' }}>
          Upload Reports
        </h1>
        <p className="text-xs text-[#4a5568] mt-1 font-mono uppercase tracking-wider">
          Drag and drop PDF reports from your PMS
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={`upload-zone p-12 text-center ${dragging ? 'dragging' : ''}`}
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
        <div className="w-16 h-16 rounded-full shadow-card bg-[#e0e5ec] flex items-center justify-center mx-auto mb-4">
          <Upload size={28} className="text-[#ff4757]" />
        </div>
        <p className="text-sm font-bold text-[#2d3436] mb-1">Drop PDF files here</p>
        <p className="text-xs text-[#4a5568]">or click to browse. Supports IHG, Hilton, Choice, and Marriott reports.</p>
      </div>

      {/* Results */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#4a5568]">
            Upload Results
          </h3>
          {files.map((file, i) => (
            <div key={`${file.fileName}-${i}`} className="card-static screws p-4 animate-fade-up">
              <div className="flex items-center gap-3">
                {/* Status Icon */}
                <div className={`w-10 h-10 rounded-full shadow-sm-neu flex items-center justify-center ${
                  file.status === 'done' ? 'text-[#22c55e]' :
                  file.status === 'error' ? 'text-[#dc2626]' :
                  'text-[#f59e0b]'
                }`}>
                  {file.status === 'done' ? <CheckCircle size={20} /> :
                   file.status === 'error' ? <AlertTriangle size={20} /> :
                   <FileText size={20} className="animate-pulse" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#2d3436] truncate">{file.fileName}</p>
                  {file.status === 'uploading' && (
                    <div className="mt-1.5 h-2 rounded-full shadow-recessed overflow-hidden">
                      <div className="h-full bg-[#f59e0b] rounded-full" style={{ width: '60%', transition: 'width 0.5s' }} />
                    </div>
                  )}
                  {file.status === 'done' && file.result && (
                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                      <BrandBadge brand={file.result.brand as 'ihg' | 'hilton' | 'choice' | 'marriott'} />
                      <span className="font-mono text-[10px] text-[#4a5568]">{file.result.hotelName}</span>
                      <span className="font-mono text-[10px] text-[#a3b1c6]">{file.result.reportDate}</span>
                    </div>
                  )}
                </div>

                {/* Parsed Stats */}
                {file.status === 'done' && file.result && (
                  <div className="flex gap-2">
                    {[
                      { label: 'Occ', value: `${file.result.stats.occupancy}%` },
                      { label: 'ADR', value: `$${file.result.stats.adr}` },
                      { label: 'Rev', value: `$${(file.result.stats.revenue / 1000).toFixed(1)}K` },
                    ].map(s => (
                      <div key={s.label} className="shadow-recessed rounded-lg px-2.5 py-1.5 text-center">
                        <div className="font-mono text-[7px] uppercase text-[#a3b1c6] font-bold">{s.label}</div>
                        <div className="font-mono text-xs font-bold text-[#2d3436]">{s.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Warnings */}
              {file.result?.warnings && file.result.warnings.length > 0 && (
                <div className="mt-3 shadow-recessed rounded-lg p-2.5 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-[#f59e0b] flex-shrink-0" />
                  <span className="text-[10px] text-[#4a5568]">{file.result.warnings.join('; ')}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
