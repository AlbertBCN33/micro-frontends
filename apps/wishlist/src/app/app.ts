import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Standalone dev harness. The shell never renders this component; it only
 * loads `wishlist.routes.ts`. It lets the team run and test the remote alone.
 */
@Component({
	selector: 'wishlist-root',
	imports: [RouterOutlet],
	templateUrl: './app.html',
	styleUrl: './app.sass',
})
export class App {}
