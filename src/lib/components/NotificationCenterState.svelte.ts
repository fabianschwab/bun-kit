import { getContext, setContext } from 'svelte';

const DEFAULT_KEY = '$_notification_center';

export type Notification = {
	id?: string;
	kind: 'error' | 'info' | 'info-square' | 'success' | 'warning' | 'warning-alt';
	title: string;
	subtitle?: string;
	caption?: string;
	timeout?: number;
	lowContrast?: boolean;
	closeButtonDescription?: string;
	statusIconDescription?: string;
	hideCloseButton?: boolean;
};

class NotificationCenterState {
	notifications = $state<Notification[]>([]);
	idCounter = $state(0);

	addNotification(notification: Notification) {
		const id = notification.id ?? `notification-${this.idCounter++}`;

		if (this.notifications.some((n) => n.id === id)) {
			return id;
		}

		this.notifications.push({ ...notification, id });

		return id;
	}

	removeNotification(id: string) {
		const index = this.notifications.findIndex((n) => n.id === id);

		if (index === -1) {
			return false;
		}

		this.notifications.splice(index, 1);
		return true;
	}

	clearNotifications() {
		this.notifications = [];
	}
}

export const getNotificationCenterState = (key = DEFAULT_KEY) => {
	return getContext<NotificationCenterState>(key);
};

export const setNotificationCenterState = (key = DEFAULT_KEY) => {
	const notificationCenter = new NotificationCenterState();
	return setContext(key, notificationCenter);
};
