'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Camera, Upload, X, Check } from 'lucide-react'
import Image from 'next/image'

interface PhotoUploadProps {
  onPhotoSelect: (file: File) => void
  selectedPhoto: File | null
  disabled?: boolean
  className?: string
}

export function PhotoUpload({ 
  onPhotoSelect, 
  selectedPhoto, 
  disabled,
  className 
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onPhotoSelect(file)
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClear = () => {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  if (preview) {
    return (
      <div className={cn('relative', className)}>
        <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-emerald-500/50">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="h-5 w-5" />
              <span className="text-sm font-medium">Foto selezionata</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-8 w-8 bg-black/50 hover:bg-black/70"
            >
              <X className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload area */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => cameraInputRef.current?.click()}
          disabled={disabled}
        >
          <Camera className="h-6 w-6" />
          <span className="text-xs">Scatta foto</span>
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Upload className="h-6 w-6" />
          <span className="text-xs">Carica foto</span>
        </Button>
      </div>

      <p className="text-center text-xs text-zinc-500">
        Scatta una foto del bicchiere vuoto per completare la tappa
      </p>
    </div>
  )
}
