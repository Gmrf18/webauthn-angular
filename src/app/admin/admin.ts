import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AdminComponent {}
