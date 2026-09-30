export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'en';

export function isSupportedLanguage(value: unknown): value is Language {
	return (
		typeof value === 'string' &&
		(SUPPORTED_LANGUAGES as readonly string[]).includes(value)
	);
}
