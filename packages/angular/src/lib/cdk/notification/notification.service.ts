import { Injectable, signal } from '@angular/core';
import { Alert, Confirmation, Snackbar } from './notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  /* Alert */
  alert = signal<Alert | undefined>(undefined);
  showAlert = (alert: Alert) => this.alert.set(alert);
  hideAlert = () => this.alert.set(undefined);

  /* Snackbar */
  snackbar = signal<Snackbar | undefined>(undefined);
  showSnackbar = (snackbar: Snackbar) => this.snackbar.set(snackbar);
  hideSnackbar = () => this.snackbar.set(undefined);

  /* Confirmation */
  confirmation = signal<Confirmation | undefined>(undefined);
  showConfirmation = (confirmation: Confirmation) => this.confirmation.set(confirmation);
  hideConfirmation = () => this.confirmation.set(undefined);
}
