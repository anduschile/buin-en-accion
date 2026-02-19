export async function compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string

            img.onload = () => {
                let width = img.width
                let height = img.height
                const MAX_DIMENSION = 1600
                const MAX_SIZE_MB = 1.5

                // Check if compression is needed
                if (file.size <= MAX_SIZE_MB * 1024 * 1024 && width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
                    resolve(file)
                    return
                }

                // Calculate new dimensions
                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height = Math.round((height * MAX_DIMENSION) / width)
                        width = MAX_DIMENSION
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width = Math.round((width * MAX_DIMENSION) / height)
                        height = MAX_DIMENSION
                    }
                }

                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'))
                    return
                }

                ctx.drawImage(img, 0, 0, width, height)

                // Convert to Blob (JPEG 0.82)
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Compression failed'))
                        return
                    }

                    // Create new File
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    })

                    resolve(compressedFile)
                }, 'image/jpeg', 0.82)
            }

            img.onerror = (err) => reject(err)
        }

        reader.onerror = (err) => reject(err)
    })
}
