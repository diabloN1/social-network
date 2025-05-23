'use server'

export async function uploadFile(formData: FormData, route: string): Promise<string> {
  try {
    const file = formData.get('file') as File

    if (!file) {
      throw new Error('No file provided')
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed')
    }

    const maxSizeInBytes = 10 * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      throw new Error('File size must be ≤ 10MB')
    }

    const uuid = crypto.randomUUID()
    const uniqueFileName = `${uuid}_${file.name.replace(/\s+/g, '-').toLowerCase()}`

    formData.append('image', file)
    formData.append('path', route)
    formData.append('filename', uniqueFileName)

    const response = await fetch('http://localhost:8080/uploadImage', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }
    
    return uniqueFileName
  } catch (error) {
    console.error(error)
    throw new Error('Failed to upload file: ' + error)
  }
}
