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

class NotificationCenterStore {
	notifications = $state<Notification[]>([]);
	idCounter = $state(0);
	showInReverse = $state(false);

	addNotification(notification: Notification) {
		const id = notification.id ?? `notification-${this.idCounter++}`;

		if (this.notifications.some((n) => n.id === id)) {
			return id;
		}

		if (this.showInReverse) {
			this.notifications = [{ ...notification, id }, ...this.notifications];
		} else {
			this.notifications.push({ ...notification, id });
		}

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

export const getNotificationCenterStore = (key = DEFAULT_KEY) => {
	return getContext<NotificationCenterStore>(key);
};

export const setNotificationCenterStore = (reverse = false, key = DEFAULT_KEY) => {
	const notificationCenter = new NotificationCenterStore();
	notificationCenter.showInReverse = reverse;
	return setContext(key, notificationCenter);
};
