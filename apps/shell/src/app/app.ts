import { Component } from '@angular/core';
import { ShellLayout } from './layout/shell-layout/shell-layout';

@Component({
	selector: 'shell-root',
	imports: [ShellLayout],
	templateUrl: './app.html',
	styleUrl: './app.sass',
})
export class App {}
