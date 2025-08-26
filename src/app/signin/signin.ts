import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  startRegistration,
  browserSupportsWebAuthn,
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/browser';
import { environment } from '../../environments/environment';
import { catchError, from, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './signin.html',
  styleUrl: './signin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SignInComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  protected readonly form = this.formBuilder.group({
    username: ['', [Validators.required]],
  });
  protected readonly isSupported = signal(browserSupportsWebAuthn());
  protected error = signal<string | undefined>(undefined);

  protected onSubmit() {
    if (this.form.invalid) {
      return;
    }
    this.error.set(undefined);

    const { username } = this.form.getRawValue();

    // 1. Get registration options from the server
    this.http
      .post<PublicKeyCredentialCreationOptionsJSON>(
        `${environment.apiUrl}/generate-registration-options`,
        { username },
      )
      .pipe(
        // 2. Use the options to ask the browser to create a new credential
        switchMap((options) => {
          console.log(options)
          // @ts-ignore
          return from(startRegistration(options))
        }),
        // 3. Send the new credential to the server for verification
        switchMap((attestation: RegistrationResponseJSON) =>
          this.http.post(`${environment.apiUrl}/verify-registration`, {
            // The API expects the credential in a `response` property
            username,
            response: attestation,
          }),
        ),
        catchError((err) => {
          const message =
            err instanceof HttpErrorResponse
              ? err.error?.error || err.message
              : (err as Error).message;
          this.error.set(message);
          return of(null); // Gracefully handle the error and complete the stream
        }),
      )
      .subscribe((result) => {
        if (result) {
          // Registration successful
          console.log('Registration successful!', result);
          // TODO: Redirect to login or dashboard
        }
      });
  }
}
