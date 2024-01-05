import type { Actions } from './$types'
import ExamplePdf from '$lib/ExamplePdf.svelte'
import { PDF } from '$lib/pdf'

export const actions: Actions = {
	render: async ({ fetch }) => {
		const pdf = new PDF(ExamplePdf, {}, fetch)
		console.log(await pdf.toFile('output.pdf'))
	},
}
