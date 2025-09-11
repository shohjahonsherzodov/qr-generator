import { type NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: {
        dark: "#059669", // emerald-600
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })

    return NextResponse.json({ qrCode: qrCodeDataUrl })
  } catch (error) {
    console.error("QR code generation error:", error)
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 })
  }
}
