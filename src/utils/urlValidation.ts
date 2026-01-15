/**
 * URL validation utilities for homework submissions
 */

export type ValidationResult = {
	isValid: boolean;
	error?: string;
};

/**
 * Validates if a URL is a valid GitHub repository URL that works with git clone
 * Valid formats:
 * - https://github.com/username/repository
 * - https://github.com/username/repository/
 */
function isValidGitHubUrl(url: string): boolean {
	// Only accept HTTPS GitHub URLs that work with git clone
	// Pattern: https://github.com/username/repository with optional trailing slash
	const httpsPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/i;

	return httpsPattern.test(url);
}

/**
 * Validates if a URL is a valid Google Drive URL
 */
function isValidGoogleDriveUrl(url: string): boolean {
	// Match Google Drive file URLs
	// https://drive.google.com/file/d/{fileId}/view?usp=sharing
	// https://drive.google.com/open?id={fileId}
	// https://drive.google.com/uc?id={fileId}
	const drivePatterns = [
		/^https:\/\/drive\.google\.com\/file\/d\/[\w-]+(?:\/view)?(?:\?.*)?$/i,
		/^https:\/\/drive\.google\.com\/open\?id=[\w-]+$/i,
		/^https:\/\/drive\.google\.com\/uc\?id=[\w-]+(?:&.*)?$/i,
	];

	return drivePatterns.some(pattern => pattern.test(url));
}

/**
 * Validates repository or file URL for homework submission
 * Supports GitHub (HTTPS only, git clone compatible) and Google Drive URLs
 */
export function validateSubmissionUrl(url: string): ValidationResult {
	// Check if URL is empty
	if (!url || !url.trim()) {
		return {
			isValid: false,
			error: 'URLを入力してください。',
		};
	}

	const trimmedUrl = url.trim();

	// Basic URL format check - must start with https:// or http://
	if (!/^https?:\/\//i.test(trimmedUrl)) {
		return {
			isValid: false,
			error: '無効なURL形式です。https://で始まる必要があります。',
		};
	}

	// Check if it's a valid GitHub URL
	if (trimmedUrl.includes('github.com')) {
		if (!isValidGitHubUrl(trimmedUrl)) {
			return {
				isValid: false,
				error: '無効なGitHub URLです。正しい形式: https://github.com/username/repository',
			};
		}
		return { isValid: true };
	}

	// Check if it's a valid Google Drive URL
	if (trimmedUrl.includes('drive.google.com')) {
		if (!isValidGoogleDriveUrl(trimmedUrl)) {
			return {
				isValid: false,
				error: '無効なGoogle Drive URLです。共有リンクを使用してください。',
			};
		}
		return { isValid: true };
	}

	// URL doesn't match GitHub or Google Drive
	return {
		isValid: false,
		error: 'GitHubまたはGoogle DriveのURLのみサポートしています。',
	};
}
