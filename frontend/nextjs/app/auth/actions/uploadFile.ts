// app/actions/uploadFile.ts
'use server'

import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function uploadFile(formData: FormData, identifier: string): Promise<string> {
  try {
    const file = formData.get('file') as File
    
    if (!file) {
      throw new Error('No file provided')
    }

    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const filename = `${identifier}_${file.name.replace(/\s+/g, '-').toLowerCase()}`
    const path = join(process.cwd(), 'public', 'avatars', filename)
    
    // Write the file
    await writeFile(path, buffer)
    
    // Return the public URL path
    return `/avatars/${filename}`
  } catch (error) {
    console.error('Error uploading file:', error)
    throw new Error('Failed to upload file')
  }
}
