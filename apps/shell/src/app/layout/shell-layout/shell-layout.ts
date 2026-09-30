import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { distinctUntilChanged, filter, map, skip } from 'rxjs';
import { Header } from '../header/header';

@Component({
	selector: 'shell-layout',
	imports: [Header, RouterOutlet, TranslatePipe],
	templateUrl: './shell-layout.html',
	styleUrl: './shell-layout.sass',
})
export class ShellLayout {
	private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

	constructor() {
		const router = inject(Router);
		// In an SPA, focus stays on the clicked link after navigation, so
		// screen-reader and keyboard users are not told that the page changed.
		// Moving focus to <main> mirrors a full page load.
		// - Only path changes count: query-param updates (e.g. the market's
		//   search-as-you-type) must not steal focus from the input.
		// - The first navigation is skipped; the browser handles initial focus.
		router.events
			.pipe(
				filter((event) => event instanceof NavigationEnd),
				map((event) => router.parseUrl(event.urlAfterRedirects)),
				map((tree) => tree.root.children['primary']?.toString() ?? ''),
				distinctUntilChanged(),
				skip(1),
				takeUntilDestroyed(),
			)
			.subscribe(() => this.focusMain());
	}

	protected skipToMain(event: Event): void {
		// A plain href="#main-content" would resolve against <base href="/"> and
		// navigate to the home page, so handle the skip link in code.
		event.preventDefault();
		this.focusMain();
	}

	private focusMain(): void {
		this.main().nativeElement.focus({ preventScroll: true });
	}
}
