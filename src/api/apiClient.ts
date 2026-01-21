import { APIResponse, ErrorType } from "../types/models";
import { LollipopError } from "./errors";
import { auth } from "../firebase/firebase";

// Configuration - set these values in your environment
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || "";

export class ApiClient {
	private baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = baseUrl || API_ENDPOINT;
	}

	private makeUrl(path: string): string {
		const base = this.baseUrl.endsWith("/") ? this.baseUrl.slice(0, -1) : this.baseUrl;
		return `${base}/${path}`;
	}

	private async getAuthToken(): Promise<string> {
		const currentUser = auth.currentUser;
		if (!currentUser) {
			throw new Error("User must be authenticated to make API requests");
		}

		try {
			// Get fresh Firebase ID token
			const token = await currentUser.getIdToken();
			return token;
		} catch (error) {
			console.error("Failed to get Firebase ID token:", error);
			throw error;
		}
	}

	private async makeRequest<T>(url: string, method: string, body?: unknown): Promise<APIResponse<T>> {
		// Get the Firebase ID token
		const authToken = await this.getAuthToken();

		const headers: HeadersInit = {
			"Content-Type": "application/json",
			Authorization: authToken,
		};

		const options: RequestInit = {
			method,
			headers,
		};

		if (body) {
			options.body = JSON.stringify(body);
		}

		try {
			const response = await fetch(url, options);
			const data: APIResponse<T> = await response.json();
			return data;
		} catch (error) {
			throw new LollipopError("unknown", "Network request failed");
		}
	}

	private checkResponseForErrors<T>(response: APIResponse<T>): void {
		if (response.status !== "success") {
			const errorType = response.error_type;
			if (errorType) {
				switch (errorType) {
					case "validation_error":
						throw LollipopError.validation(response.message);
					case "auth_error":
						throw LollipopError.auth();
					case "forbidden_error":
						throw LollipopError.forbidden();
					case "not_found_error":
						throw LollipopError.notFound();
					case "server_error":
						throw LollipopError.server();
					case "unsupported_repo_url":
						throw LollipopError.unsupportedRepoUrl();
					case "unsupported_file_type":
						throw LollipopError.unsupportedFileType();
					default:
						throw new LollipopError(errorType as ErrorType, response.message);
				}
			}
			throw new LollipopError("unknown", response.message);
		}
	}

	async get<T>(path: string, params?: Record<string, string>): Promise<T[]> {
		let url = this.makeUrl(path);
		if (params) {
			const searchParams = new URLSearchParams(params);
			url = `${url}?${searchParams.toString()}`;
		}
		const response = await this.makeRequest<T>(url, "GET");
		this.checkResponseForErrors(response);
		return response.data || [];
	}

	async getOne<T>(path: string, params?: Record<string, string>): Promise<T | null> {
		const results = await this.get<T>(path, params);
		return results[0] || null;
	}

	async post<T>(path: string, body: unknown): Promise<APIResponse<T>> {
		const url = this.makeUrl(path);
		const response = await this.makeRequest<T>(url, "POST", body);
		this.checkResponseForErrors(response);
		return response;
	}

	async patch<T>(path: string, body: unknown): Promise<APIResponse<T>> {
		const url = this.makeUrl(path);
		const response = await this.makeRequest<T>(url, "PATCH", body);
		this.checkResponseForErrors(response);
		return response;
	}

	async delete<T>(path: string, body: unknown): Promise<APIResponse<T>> {
		const url = this.makeUrl(path);
		const response = await this.makeRequest<T>(url, "DELETE", body);
		this.checkResponseForErrors(response);
		return response;
	}
}

// Default singleton instance
export const apiClient = new ApiClient();
