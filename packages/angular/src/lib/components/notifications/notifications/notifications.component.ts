import { Component, computed, effect, inject, signal } from '@angular/core';
import { Alert, Confirmation, NotificationService, Snackbar } from '../../../cdk';
import { UniAlertComponent } from '../alert/alert.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { UniSnackbarComponent } from '../snackbar/snackbar.component';

@Component({
  selector: 'uni-notifications, Notifications',
  standalone: true,
  imports: [UniAlertComponent, UniSnackbarComponent, ConfirmationDialogComponent],
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent {
  notifications = inject(NotificationService);

  private readonly alertState = signal<Alert | undefined>(undefined);
  private readonly snackbarState = signal<Snackbar | undefined>(undefined);
  private readonly confirmationState = signal<Confirmation | undefined>(undefined);

  // Computed values for the show states
  protected readonly showAlert = computed(() => !!this.alertState());
  protected readonly showSnackbar = computed(() => !!this.snackbarState());
  protected readonly showConfirmation = computed(() => !!this.confirmationState());

  // Expose the alert state
  protected readonly alert = computed(() => this.alertState());
  protected readonly snackbar = computed(() => this.snackbarState());
  protected readonly confirmation = computed(() => this.confirmationState());

  constructor() {
    effect(() => {
      this.alertState.set(this.notifications.alert());
    });
    effect(() => {
      this.snackbarState.set(this.notifications.snackbar());
    });
    effect(() => {
      this.confirmationState.set(this.notifications.confirmation());
    });
  }

  handleConfirmationShowingEvent(showing: boolean) {
    if (!showing) this.notifications.hideConfirmation();
  }

  handleSnackbarShowingEvent(showing: boolean) {
    if (!showing) this.notifications.hideSnackbar();
  }

  handleAlertShowingEvent(showing: boolean) {
    if (!showing) this.notifications.hideAlert();
  }
}
