/**
 * Calculate estimated reading time for text content
 * @param text - The text content to analyze
 * @param wordsPerMinute - Reading speed (default: 500 characters per minute for Korean text)
 * @returns Estimated reading time in minutes
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 500): number {
	const characterCount = text.length;
	const minutes = characterCount / wordsPerMinute;
	const readingTime = Math.ceil(minutes);

	// Return at least 1 minute
	return readingTime < 1 ? 1 : readingTime;
}
