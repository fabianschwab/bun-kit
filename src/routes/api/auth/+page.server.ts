import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getAuth } from '$lib/server/auth';

// Using form actions because this will work also while javascript is turned off
export const actions: Actions = {
	login: async (event) => {
		const auth = getAuth();
		const formData = await event.request.formData();
		const provider = formData.get('provider')?.toString();

		if (!provider) {
			return fail(400, { message: 'Provider is required' });
		}

		// const callbackURL = formData.get('callbackURL')?.toString() ?? '/';

		const result = await auth.api.signInWithOAuth2({
			body: {
				providerId: provider
				// callbackURL
			}
		});

		if (result.url) {
			return redirect(302, result.url);
		}
		return fail(400, { message: 'Social sign-in failed' });
	},
	logout: async (event) => {
		const auth = getAuth();
		await auth.api.signOut({ headers: event.request.headers });
		return redirect(302, '/');
	}
};
