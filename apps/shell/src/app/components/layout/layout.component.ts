import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../header/header.component";
import { RouterModule } from '@angular/router';
//import { PageTitleComponent } from '@micro-frontends/ui-components';

@Component({
	selector: 'app-layout',
	standalone: true,
	imports: [
		CommonModule,
		HeaderComponent,
		RouterModule,
		//PageTitleComponent
	],
	templateUrl: './layout.component.html',
	styleUrl: './layout.component.sass',
})
export class LayoutComponent {}
