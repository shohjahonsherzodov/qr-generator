"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { QrCode, Download, Copy, RotateCcw, Github, Youtube, Instagram, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function QRGenerator() {
  const [text, setText] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateQRCode = async (inputText: string) => {
    if (!inputText.trim()) {
      setQrCodeUrl("")
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      })

      if (!response.ok) {
        throw new Error("QR kod yaratishda xatolik")
      }

      const data = await response.json()
      setQrCodeUrl(data.qrCode)
    } catch (error) {
      console.error("QR code generation error:", error)
      toast({
        title: "Xatolik",
        description: "QR kod yaratishda xatolik yuz berdi.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Auto-generate QR code when text changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      generateQRCode(text)
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [text])

  const handleReset = () => {
    setText("")
    setQrCodeUrl("")
  }

  const handleDownload = () => {
    if (!qrCodeUrl) return

    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `qr-code-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "QR kod yuklab olindi!",
      description: "QR kod muvaffaqiyatli yuklab olindi.",
    })
  }

  const handleCopyText = async () => {
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Matn nusxalandi!",
        description: "Matn clipboardga nusxalandi.",
      })
    } catch (err) {
      toast({
        title: "Xatolik",
        description: "Matnni nusxalashda xatolik yuz berdi.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <QrCode className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">QR Kod Generatori</h1>
            </div>
            <p className="text-muted-foreground text-base md:text-lg">Matn kiriting va uni QR kodga aylantiring</p>
          </div>

          <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
            {/* Input Section */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <span>Matn kiriting</span>
                </CardTitle>
                <CardDescription>QR kodga aylantirilishi kerak bo'lgan matnni kiriting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text-input">Matn</Label>
                  <Input
                    id="text-input"
                    placeholder="Bu yerga matn kiriting..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleCopyText}
                    variant="outline"
                    size="sm"
                    disabled={!text}
                    className="flex-1 bg-transparent"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Nusxalash
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="sm" disabled={!text}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Tozalash
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">QR Kod</CardTitle>
                <CardDescription>Yaratilgan QR kod bu yerda ko'rsatiladi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-full max-w-[280px] md:max-w-[300px] aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/20">
                    {isGenerating ? (
                      <div className="flex flex-col items-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">QR kod yaratilmoqda...</p>
                      </div>
                    ) : qrCodeUrl ? (
                      <div className="animate-in fade-in-0 zoom-in-95 duration-300 w-full h-full p-4">
                        <img
                          src={qrCodeUrl || "/placeholder.svg"}
                          alt="Generated QR Code"
                          className="w-full h-full object-contain rounded-lg shadow-lg"
                        />
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <QrCode className="h-12 md:h-16 w-12 md:w-16 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground px-4">QR kod bu yerda paydo bo'ladi</p>
                      </div>
                    )}
                  </div>

                  {qrCodeUrl && (
                    <Button onClick={handleDownload} className="w-full animate-in slide-in-from-bottom-2 duration-300">
                      <Download className="h-4 w-4 mr-2" />
                      QR kodni yuklab olish
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="mt-6 md:mt-8">
            <CardContent className="pt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-center">
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <QrCode className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Tez va oson</h3>
                  <p className="text-sm text-muted-foreground">Matn kiritganingizda avtomatik QR kod yaratiladi</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Yuklab olish</h3>
                  <p className="text-sm text-muted-foreground">Yaratilgan QR kodni PNG formatida yuklab oling</p>
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Copy className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Nusxalash</h3>
                  <p className="text-sm text-muted-foreground">Matnni osongina nusxalash va ulashish</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer with developer info and social media links */}
      <footer className="border-t bg-muted/30 mt-8">
        <div className="mx-auto max-w-4xl px-4 py-6 md:py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Dasturchi: <span className="text-primary">Sherzodov Shohjahon</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">Full-Stack Developer</p>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/shohjahonsherzodov"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-background border hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com/@shoh-coder"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-background border hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/shohjahon2011_blog"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-background border hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://t.me/shohjahon2011_blog"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-background border hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Telegram"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">© 2025 QR Kod Generatori. Barcha huquqlar himoyalangan.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
