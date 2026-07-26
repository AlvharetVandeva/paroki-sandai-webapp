import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import crypto from "crypto";
import sharp from "sharp";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    // Only authenticated users can upload files
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Compress and convert to WebP using sharp
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 80 })
      .toBuffer();

    // Create a unique filename
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const filename = `uploads/${uniqueSuffix}.webp`;

    // Upload to Vercel Blob Storage — pakai Blob object, bukan Buffer
    // Buffer menyebabkan SharedArrayBuffer error di Vercel Node.js runtime
    const blob = await put(filename, new Blob([webpBuffer], { type: "image/webp" }), {
      access: "public",
    });

    return NextResponse.json({
      url: blob.url,
      success: true,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
