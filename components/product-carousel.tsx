"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductCarouselProps {
  images: string[]
  productName: string
}

export function ProductCarousel({ images, productName }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <div className="flex h-full items-center justify-center text-muted-foreground">Sem imagem</div>
      </div>
    )
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="group relative">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <Image
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`${productName} - Imagem ${currentIndex + 1}`}
          fill
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            onClick={goToPrevious}
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            onClick={goToNext}
            aria-label="Próxima imagem"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentIndex ? "bg-primary w-8" : "bg-background/60 backdrop-blur-sm w-2",
                )}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
