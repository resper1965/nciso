import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'

// =====================================================
// TYPES
// =====================================================

export interface DocumentFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  status: 'uploading' | 'success' | 'error'
  progress?: number
  error?: string
}

export interface DocumentUploaderProps {
  value?: DocumentFile[]
  onChange?: (files: DocumentFile[]) => void
  onUpload?: (file: File) => Promise<DocumentFile>
  accept?: string
  maxSize?: number
  multiple?: boolean
  className?: string
  disabled?: boolean
}

// =====================================================
// COMPONENT
// =====================================================

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  value = [],
  onChange,
  onUpload,
  accept = '.pdf,.doc,.docx,.txt',
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  className = '',
  disabled = false
}) => {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)

  // =====================================================
  // DROPZONE CONFIG
  // =====================================================

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || uploading) return

    setUploading(true)
    const newFiles: DocumentFile[] = []

    try {
      for (const file of acceptedFiles) {
        const documentFile: DocumentFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'uploading',
          progress: 0
        }

        newFiles.push(documentFile)

        // Simular upload progress
        const interval = setInterval(() => {
          const currentFile = newFiles.find(f => f.id === documentFile.id)
          if (currentFile && currentFile.progress! < 100) {
            currentFile.progress! += 10
            onChange?.([...value, ...newFiles])
          } else {
            clearInterval(interval)
          }
        }, 100)

        // Simular upload completion
        setTimeout(() => {
          const currentFile = newFiles.find(f => f.id === documentFile.id)
          if (currentFile) {
            currentFile.status = 'success'
            currentFile.progress = 100
            currentFile.url = URL.createObjectURL(file)
            onChange?.([...value, ...newFiles])
          }
        }, 1000)
      }
    } catch (error) {
      console.error('Upload error:', error)
      newFiles.forEach(file => {
        file.status = 'error'
        file.error = t('forms.policy.upload_error')
      })
      onChange?.([...value, ...newFiles])
    } finally {
      setUploading(false)
    }
  }, [value, onChange, disabled, uploading, t])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, type) => {
      acc[type.trim()] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize,
    multiple,
    disabled
  })

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleRemoveFile = (fileId: string) => {
    const updatedFiles = value.filter(file => file.id !== fileId)
    onChange?.(updatedFiles)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('doc')) return '📝'
    if (type.includes('txt')) return '📄'
    return '📎'
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive && !isDragReject ? 'border-nciso-cyan bg-nciso-cyan/5' : 'border-gray-300'}
          ${isDragReject ? 'border-red-500 bg-red-50' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-nciso-cyan'}
        `}
      >
        <input {...getInputProps()} />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            {isDragActive 
              ? t('forms.policy.drop_files_here')
              : t('forms.policy.drag_drop_or_click')
            }
          </p>
          
          <p className="text-sm text-gray-500">
            {t('forms.policy.supported_formats', { formats: accept })}
          </p>
          
          <p className="text-xs text-gray-400">
            {t('forms.policy.max_size', { size: formatFileSize(maxSize) })}
          </p>
        </div>
      </div>

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            {t('forms.policy.uploaded_files')} ({value.length})
          </h4>
          
          {value.map((file) => (
            <Card key={file.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getFileIcon(file.type)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Status Badge */}
                    <Badge 
                      variant={
                        file.status === 'success' ? 'default' :
                        file.status === 'error' ? 'destructive' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {file.status === 'success' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {file.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {t(`forms.policy.status.${file.status}`)}
                    </Badge>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(file.id)}
                      disabled={file.status === 'uploading'}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                {file.status === 'uploading' && file.progress !== undefined && (
                  <div className="mt-3">
                    <Progress value={file.progress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('forms.policy.uploading_progress', { progress: file.progress })}
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {file.status === 'error' && file.error && (
                  <p className="text-xs text-red-500 mt-2">
                    {file.error}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// =====================================================
// HOOK
// =====================================================

export const useDocumentUploader = () => {
  const [files, setFiles] = useState<DocumentFile[]>([])

  const handleUpload = useCallback(async (file: File): Promise<DocumentFile> => {
    // Implementar lógica de upload real aqui
    return new Promise((resolve) => {
      setTimeout(() => {
        const documentFile: DocumentFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'success',
          url: URL.createObjectURL(file)
        }
        resolve(documentFile)
      }, 1000)
    })
  }

  return {
    files,
    setFiles,
    handleUpload
  }
} 