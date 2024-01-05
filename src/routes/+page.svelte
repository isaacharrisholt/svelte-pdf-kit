<script lang="ts">
	import { enhance } from '$app/forms'
	import ExamplePdf from '$lib/ExamplePdf.svelte'

	async function downloadPdf() {
		console.log('Downloading PDF...')
		const res = await fetch('/', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		})
		if (!res.ok) {
			alert(`Error ${res.status}: ${await res.text()}`)
			return
		}
		const blob = await res.blob()
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'example.pdf'
		a.click()
		URL.revokeObjectURL(url)
	}
</script>

<form method="POST" action="?/render" use:enhance>
	<button>RENDER</button>
</form>
<button on:click={downloadPdf}>DOWNLOAD</button>

<ExamplePdf />
