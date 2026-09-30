import { TestBed } from '@angular/core/testing';
import { Language, provideRootTranslations } from '@mfe/shared-util-i18n';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

/** The shell's real translation files, so tests fail on missing keys. */
export const provideShellTranslations = () =>
	provideRootTranslations((lang) => import(`../../assets/i18n/${lang}.json`));

/**
 * Switches language and waits for the file. The JSON import is not tracked by
 * whenStable(), so tests must await it explicitly.
 */
export const useLanguage = (lang: Language) =>
	firstValueFrom(TestBed.inject(TranslateService).use(lang));
