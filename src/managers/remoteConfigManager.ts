// src/managers/remoteConfigManager.ts
import { getRemoteConfig, fetchAndActivate, getString, getValue } from "firebase/remote-config";
import { app } from "../firebase/firebase";

const STORAGE_KEY_PREFIX = "cached_";
const REMOTE_KEY_API_ENDPOINT = "API_ENDPOINT";
const REMOTE_KEY_MAIN_TIMER_DURATION = "MAIN_TIMER_DURATION";
const REMOTE_KEY_ARC_TIMER_DURATION = "ARC_TIMER_DURATION";

const DEFAULT_API_ENDPOINT = "https://api.hlumaungphyo.site/";
const DEFAULT_MAIN_TIMER_DURATION = 60;
const DEFAULT_ARC_TIMER_DURATION = 30;

class RemoteConfigManager {
	private static instance: RemoteConfigManager;
	private remoteConfig;

	private constructor() {
		this.remoteConfig = getRemoteConfig(app);
		// Set minimum fetch interval to 0 for development (use a higher value in production)
		this.remoteConfig.settings.minimumFetchIntervalMillis = 0;
	}

	public static getInstance(): RemoteConfigManager {
		if (!RemoteConfigManager.instance) {
			RemoteConfigManager.instance = new RemoteConfigManager();
		}
		return RemoteConfigManager.instance;
	}

	// Getters and setters for API endpoint
	get apiEndpoint(): string {
		return localStorage.getItem(`${STORAGE_KEY_PREFIX}api_endpoint`) || DEFAULT_API_ENDPOINT;
	}

	private set apiEndpoint(value: string) {
		localStorage.setItem(`${STORAGE_KEY_PREFIX}api_endpoint`, value);
	}

	// Getters and setters for main timer duration
	get mainTimerDuration(): number {
		const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}main_timer_duration`);
		return stored ? parseInt(stored, 10) : DEFAULT_MAIN_TIMER_DURATION;
	}

	private set mainTimerDuration(value: number) {
		localStorage.setItem(`${STORAGE_KEY_PREFIX}main_timer_duration`, value.toString());
	}

	// Getters and setters for arc timer duration
	get arcTimerDuration(): number {
		const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}arc_timer_duration`);
		return stored ? parseInt(stored, 10) : DEFAULT_ARC_TIMER_DURATION;
	}

	private set arcTimerDuration(value: number) {
		localStorage.setItem(`${STORAGE_KEY_PREFIX}arc_timer_duration`, value.toString());
	}

	// Fetch and activate remote config
	public async fetchRemoteConfig(): Promise<void> {
		try {
			const activated = await fetchAndActivate(this.remoteConfig);

			if (activated) {
				console.info("Remote Config fetched from remote");
			} else {
				console.info("Remote Config using cached data");
			}

			// Fetch and update API endpoint
			const newEndpoint = getString(this.remoteConfig, REMOTE_KEY_API_ENDPOINT);
			if (newEndpoint && newEndpoint.length > 0) {
				this.apiEndpoint = newEndpoint;
				console.info(`API_ENDPOINT updated: ${this.apiEndpoint}`);
			}

			// Fetch and update main timer duration
			const newMainTimerDuration = getValue(this.remoteConfig, REMOTE_KEY_MAIN_TIMER_DURATION).asNumber();
			if (newMainTimerDuration > 0) {
				this.mainTimerDuration = newMainTimerDuration;
				console.info(`MainTimerDuration updated: ${this.mainTimerDuration}`);
			}

			// Fetch and update arc timer duration
			const newArcTimerDuration = getValue(this.remoteConfig, REMOTE_KEY_ARC_TIMER_DURATION).asNumber();
			if (newArcTimerDuration > 0) {
				this.arcTimerDuration = newArcTimerDuration;
				console.info(`ArcTimerDuration updated: ${this.arcTimerDuration}`);
			}
		} catch (error) {
			console.error("Failed to fetch Remote Config:", error);
		}
	}
}

// Export singleton instance
export const remoteConfigManager = RemoteConfigManager.getInstance();
