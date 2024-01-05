import type { RequestHandler } from "./$types";
import ExamplePdf from '$lib/ExamplePdf.svelte'
import { PDF } from '$lib/pdf'

export const GET: RequestHandler = async ({ fetch }) => {
  console.log('Got request, generating PDF...')
  const pdf = new PDF(ExamplePdf, {}, fetch)
  const { data: buf, error: err } = await pdf.toBuffer()
  console.log('Generated PDF')

  if (err) {
    return new Response(err.message, {
      status: 500,
      headers: {
        'content-type': 'text/plain'
      }
    })
  }

  return new Response(buf, {
    status: 200,
    headers: {
      'content-type': 'application/pdf'
    }
  })
}
