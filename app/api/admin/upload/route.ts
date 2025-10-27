import { NextRequest, NextResponse } from "next/server"
import { cloudinary } from "@/lib/cloudinary"
import { cookies } from "next/headers";

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  
    if (!cookieStore.get(process.env.AUTH_COOKIE) && !cookieStore.get(process.env.AUTH_CALLBACK_URL) && !cookieStore.get(process.env.AUTH_CSRF_TOKEN)) {
    return NextResponse.json({ error: "unauthorized", message: "dpiawbndoianbwdawd" }, { status: 401 });
  }
  const form = await req.formData()
  const file = form.get("file") as unknown as File
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const res = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "bm/products" }, (err, result) =>
      err ? reject(err) : resolve(result)
    )
    stream.end(buffer)
  })

  return NextResponse.json({ url: res.secure_url })
}
