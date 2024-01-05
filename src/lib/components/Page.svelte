<script lang="ts">
	import type { PageOptions } from '$lib/types'

	export let options: PageOptions | null = null
</script>

<div
	data-svelte-pdf-kit-type="page"
	data-svelte-pdf-kit-options={options && JSON.stringify(options)}
>
	<slot />
</div>
