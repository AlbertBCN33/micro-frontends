import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Inline SVG, so it inherits the theme tokens (it works in dark mode) and its
 * text stays selectable and translatable. role="img" with a <title> and <desc>
 * gives screen readers a summary; the list below it carries the same
 * information as text.
 */
@Component({
	selector: 'shell-architecture-diagram',
	imports: [TranslatePipe],
	templateUrl: './architecture-diagram.html',
	styleUrl: './architecture-diagram.sass',
})
export class ArchitectureDiagram {}
