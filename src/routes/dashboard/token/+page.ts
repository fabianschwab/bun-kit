import type { PageLoad } from './$types';
import { authClient } from '$lib/auth-client';

export const ssr = false;

export const load: PageLoad = async () => {
	const { data, error } = await authClient.token();

	return {
		token: data?.token
	};
};
