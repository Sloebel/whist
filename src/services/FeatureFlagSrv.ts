import { fire } from '../firebase';

type Unsubscribe = () => void;

export default class FeatureFlagService {
	public static subscribe<T = boolean>(flagKey: string, callback: (value: T) => void): Unsubscribe {
		const ref = fire.database().ref(`featureFlags/${flagKey}`);

		const listener = ref.on('value', (snap) => {
			callback(snap.val() as T);
		}, (error: Error) => {
			console.error(`[FeatureFlagService] Failed to read featureFlags/${flagKey}:`, error);
		});

		return () => ref.off('value', listener);
	}
}
