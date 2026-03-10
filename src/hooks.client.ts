import type { HandleClientError } from '@sveltejs/kit';

// This runs on every navigation in the browser
export const handleError: HandleClientError = ({ error }) => {
	console.error('Client error:', error);
	return {
		message: 'An error occurred'
	};
};

// Handle browser navigation (including back/forward buttons)
if (typeof window !== 'undefined') {
	// Listen for page show events (fires when navigating via back/forward)
	window.addEventListener('pageshow', (event) => {
		// If the page is loaded from cache (bfcache)
		if (event.persisted) {
			// Force a reload to check authentication status
			window.location.reload();
		}
	});
}
