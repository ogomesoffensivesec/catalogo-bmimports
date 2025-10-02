// src/components/admin/image-upload.tsx
"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UploadCloud, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

export type ImageItem = { url: string; alt?: string; position: number }

export function ImageUpload({
  value,
  onChange,
  className,
}: {
  value: ImageItem[]
  onChange: (imgs: ImageItem[]) => void
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return
    setLoading(true)
    try {
      const uploaded: ImageItem[] = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append("file", file)
        const r = await fetch("/api/admin/upload", { method: "POST", body: fd })
        if (!r.ok) throw new Error("Falha no upload")
        const { url } = await r.json()
        uploaded.push({ url, position: (value[value.length - 1]?.position ?? -1) + 1 })
      }
      onChange([...(value || []), ...uploaded])
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    await uploadFiles(e.dataTransfer.files)
  }

  const move = (idx: number, dir: -1 | 1) => {
    const arr = [...value]
    const j = idx + dir
    if (j < 0 || j >= arr.length) return
      ;[arr[idx], arr[j]] = [arr[j], arr[idx]]
    onChange(arr.map((im, i) => ({ ...im, position: i })))
  }

  const remove = (idx: number) => {
    const arr = value.filter((_, i) => i !== idx).map((x, i) => ({ ...x, position: i }))
    onChange(arr)
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Dropzone bonita com dashed */}
      <div
        className={cn(
          "rounded-lg border-2 border-dashed p-6 text-center",
          "bg-card/40 border-border",
          dragOver && "bg-muted/30",
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg, image/png"
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />
        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
          <UploadCloud className="size-5 text-muted-foreground" />
        </div>
        <div className="text-sm">
          <span className="font-medium">Clique para enviar</span> ou arraste as imagens aqui
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          PNG, JPG, JFIF — até alguns MB cada. {loading && "Enviando…"}
        </div>
      </div>

      {/* Grid de thumbnails */}
      {value?.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((im, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-card p-2">
              <div className="aspect-video w-full overflow-hidden rounded-md bg-muted relative">
                {im.url ? (
                  <Image
                    src={im.url}
                    alt={im.alt || `Imagem ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
               
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <ImageIcon className="size-5" />
                  </div>
                )}
              </div>

              <div className="mt-2 grid grid-cols-3 gap-1">
                <Button type="button" variant="outline" size="sm" className="border-border" onClick={() => move(idx, -1)}>
                  ↑
                </Button>
                <Button type="button" variant="outline" size="sm" className="border-border" onClick={() => move(idx, +1)}>
                  ↓
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={() => remove(idx)}>
                  X
                </Button>
              </div>

              <input
                className="mt-2 h-9 w-full rounded-md border border-border bg-background px-2 text-xs"
                placeholder="alt/descrição"
                value={im.alt || ""}
                onChange={(e) => {
                  const arr = [...value]
                  arr[idx] = { ...im, alt: e.target.value }
                  onChange(arr)
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
