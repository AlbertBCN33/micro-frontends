import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Standalone dev harness. The shell never renders this component; it only
 * loads `market.routes.ts`. It lets the team run and test the remote alone.
 */
@Component({
	selector: 'market-root',
	imports: [RouterOutlet],
	templateUrl: './app.html',
	styleUrl: './app.sass',
})
export class App {}
