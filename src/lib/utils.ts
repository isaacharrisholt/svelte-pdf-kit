import fsPromises from 'fs/promises'
import type { PDFResult } from './types'
import { DEFAULT_FETCH } from './constants'

/**
* Fetches a file from the given src.
* Will check local filesystem first, then fallback to fetch.
*/
export async function fetchFile(src: string, fetch = DEFAULT_FETCH): Promise<PDFResult<ArrayBuffer>> {
  // Fetch from filesystem
  try {
    const fileContents = await fsPromises.readFile(src)
    return { data: fileContents, error: null }
  } catch (error) {
    // Ignore error
  }

  let response: Response
  try {
    response = await fetch(src)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return { data: null, error: new Error(err) }
  }
  if (!response.ok && response.status !== 404) {
    return {
      data: null,
      error: new Error(`Failed to fetch file at ${src}: ${response.statusText}`)
    }
  }

  if (!response.ok && response.status !== 404) {
    return {
      data: null,
      error: new Error(`Failed to fetch file at ${src}: ${response.statusText}`)
    }
  }

  if (response.status === 404) {
    return {
      data: null,
      error: new Error(`File not found: ${src}`)
    }
  }

  const buffer = await response.arrayBuffer()
  return { data: buffer, error: null }
}

