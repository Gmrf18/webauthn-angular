import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  startAuthentication,
  browserSupportsWebAuthn,
} from '@simplewebauthn/browser';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../environments/environment'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  private readonly http = inject(HttpClient);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly form = this.formBuilder.group({
    username: ['', [Validators.required]],
  });
  protected readonly isSupported = signal(browserSupportsWebAuthn());
  protected error = signal<string | undefined>(undefined);

  protected async onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const { username } = this.form.getRawValue();

    this.http
      .post(
        // IMPORTANT: Replace with your backend endpoint
        environment.apiUrl +'/generate-login-options',
        { username },
      )
      .subscribe({
        next: async (options: any) => {
          try {
            const assertion = await startAuthentication(options);
            this.http
              .post(
                // IMPORTANT: Replace with your backend endpoint
                environment.apiUrl+ '/verify-login',
                { username, assertion },
              )
              .subscribe({
                next: () => {
                  this.error.set(undefined);
                  // Redirect to dashboard
                },
                error: (err) => this.error.set(err.message),
              });
          } catch (err) {
            this.error.set((err as Error).message);
          }
        },
        error: (err) => this.error.set(err.message),
      });
  }
}

