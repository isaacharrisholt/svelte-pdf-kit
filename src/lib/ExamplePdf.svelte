<script lang="ts">
	import Document from './components/Document.svelte'
	import Page from './components/Page.svelte'
	import Text from './components/Text.svelte'
	import Image from './components/Image.svelte'
	import Font from './components/Font.svelte'

	const weights = [100, 300, 400, 500, 700, 900] as const
	const styles = ['normal', 'italic'] as const

	const fonts = weights.flatMap((weight) => styles.map((style) => ({ weight, style })))
</script>

<Document autoFirstPage debug={false}>
	<Font
		src={fonts.map(({ weight, style }) => ({
			src: `https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-${weight}-${style}.ttf`,
			weight,
			style,
		}))}
		family="Poppins"
	/>

	<Page>
		<Text font="Poppins">This is my document</Text>
		<Text font="Poppins" align="right" columns={2} style="italic" weight="medium"
			>Another line</Text
		>
		<Image src="/favicon.png" alt="" width={50} />
	</Page>

	<Page orientation="landscape">
		<Text font="Poppins" align="center">This is page 2!</Text>
		<Image src="/favicon.png" alt="" width={150} />
	</Page>
</Document>
