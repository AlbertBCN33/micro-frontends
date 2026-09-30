import { Component } from '@angular/core';
import { ShellLayout } from './layout/shell-layout/shell-layout';

@Component({
	selector: 'shell-root',
	imports: [ShellLayout],
	template: '<shell-layout />',
})
export class App {}
