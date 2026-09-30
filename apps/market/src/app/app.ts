import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Standalone dev harness. The shell never renders this component; it only
 * loads `market.routes.ts`. It lets the team run and test the remote alone.
 */
@Component({
	selector: 'market-root',
	imports: [RouterOutlet],
	template: `
		<p class="banner">Market · standalone mode</p>
		<main id="main-content" class="content"><router-outlet /></main>
	`,
	styleUrl: './app.sass',
})
export class App {}
