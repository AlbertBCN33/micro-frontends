import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'app-header',
	standalone: true,
	imports: [CommonModule, RouterModule, TranslatePipe],
	templateUrl: './header.component.html',
	styleUrl: './header.component.sass',
})
export class HeaderComponent {}
