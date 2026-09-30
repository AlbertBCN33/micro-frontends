import { InjectionToken } from '@angular/core';
import { firebaseConfig } from './firebase-config.generated';

/** Firebase web app configuration (Firebase console → Project settings). */
export interface FirebaseWebConfig {
	readonly apiKey: string;
	readonly authDomain: string;
	readonly projectId: string;
	readonly storageBucket: string;
	readonly messagingSenderId: string;
	readonly appId: string;
	readonly measurementId?: string;
}

/**
 * The Firebase config for this build, or `null` when `.env` does not define
 * one, so the app runs without Firebase.
 *
 * The values come from `.env` at build time (see `.env.example` and
 * tools/scripts/generate-env.mjs); they are never committed. Inject this token
 * instead of importing the generated file, so tests can provide their own.
 */
export const FIREBASE_CONFIG = new InjectionToken<FirebaseWebConfig | null>(
	'FIREBASE_CONFIG',
	{ providedIn: 'root', factory: () => firebaseConfig },
);
