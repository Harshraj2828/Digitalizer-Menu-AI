import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client if keys are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured =
  supabaseUrl &&
  supabaseUrl !== "" &&
  supabaseUrl !== "https://your-supabase-project.supabase.co" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "" &&
  supabaseAnonKey !== "your-anon-key-here";

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

/**
 * Uploads a file buffer to storage.
 * If Supabase is configured, uploads to a bucket named 'menus'.
 * If not, writes the file to the local next.js public/uploads folder.
 */
export async function uploadImage(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const uniqueName = `${Date.now()}-${fileName.replace(/\s+/g, "_")}`;

  if (supabase) {
    try {
      console.log("Uploading to Supabase Storage:", uniqueName);
      
      // Ensure 'menus' bucket is configured as a public bucket
      const { data, error } = await supabase.storage
        .from("menus")
        .upload(uniqueName, fileBuffer, {
          contentType,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("menus")
        .getPublicUrl(uniqueName);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error("Supabase upload failed, falling back to local file storage:", err);
    }
  }

  // Local fallback storage (with try-catch for read-only environments like Vercel)
  try {
    console.log("Saving image locally (mock upload):", uniqueName);
    const uploadDir = path.join(process.cwd(), "public/uploads");
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(filePath, fileBuffer);

    return `/uploads/${uniqueName}`;
  } catch (fsErr) {
    console.warn("Local storage write failed (likely read-only serverless environment), returning placeholder:", fsErr);
    return "/sample-menu.png";
  }
}
