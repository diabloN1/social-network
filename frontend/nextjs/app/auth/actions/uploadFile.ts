'use server'

import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function uploadFile(formData: FormData): Promise<string> {
  try {
    const file = formData.get('file') as File

    if (!file) {
      throw new Error('No file provided')
    }

    // Check file type (MIME type must start with 'image/')
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed')
    }

    // Check file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSizeInBytes = 10 * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      throw new Error('File size must be less than or equal to 10MB')
    }

    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uuid = crypto.randomUUID()
    const filename = `${uuid}_${file.name.replace(/\s+/g, '-').toLowerCase()}`
    const path = join(process.cwd(), 'public', 'avatars', filename)

    // Write the file
    await writeFile(path, buffer)

    // Return the public URL path
    return `/avatars/${filename}`
  } catch (error) {
    console.error('Error uploading file:', error)
    throw new Error('Failed to upload file ' + error)
  }
}
