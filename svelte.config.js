import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			// Serves the prerendered 404 page for unknown paths. Note that
			// setting `fallback` makes adapter-static skip its dynamic-route
			// check entirely, so `strict` would be a no-op here — the
			// prerender coverage of `[slug]` routes relies on each route's
			// `entries` export instead.
			fallback: '404.html',
			precompress: false
		}),
		prerender: {
			// Every route is prerendered; this only silences link checks for
			// routes that are intentionally not part of the static output.
			handleUnseenRoutes: 'ignore',
			handleHttpError: ({ path, message }) => {
				if (path === '/favicon.ico' || path.startsWith('/mediainfo/')) {
					return;
				}

				throw new Error(message);
			}
		}
	}
};

export default config;
