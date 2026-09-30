// Markdown files are bundled as plain text (esbuild `loader: { ".md": "text" }`,
// and a small Vite plugin in tests).
declare module '*.md' {
	const content: string;
	export default content;
}
