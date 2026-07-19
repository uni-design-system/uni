import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NotificationService } from './notification.service';
import { NotificationsComponent } from '../../components/notifications';
import { UniButtonComponent, UniRowComponent } from '../../components';

@Component({
  selector: 'uni-notifications-story-component, notifications-story-component',
  template: `<div row-layout gap="md">
      @if (!test() || test() === 'alert') {
        <button text-button (click)="showAlert()">Show Alert</button>
      }
      @if (!test() || test() === 'snackbar') {
        <button text-button (click)="showSnackbar()">Show Snackbar</button>
      }
      @if (!test() || test() === 'confirmation') {
        <button text-button (click)="showConfirmation()">Show Confirmation</button>
      }
    </div>
    @if (test()) {
      <Notifications></Notifications>
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NotificationsComponent, UniRowComponent, UniButtonComponent],
})
export class NotificationStoryComponent {
  private notifications = inject(NotificationService);

  test = input<'alert' | 'snackbar' | 'confirmation'>();

  showAlert = () => this.notifications.showAlert({ message: 'This is the Alert test.' });

  showSnackbar = () =>
    this.notifications.showSnackbar({
      message: 'This is the Snackbar test.',
      actionLabel: 'Show Alert',
      action: () => this.showAlert(),
    });

  showConfirmation = () =>
    this.notifications.showConfirmation({
      title: 'Confirmation Dialog',
      message: 'Testing the confirmation dialog.',
      action: () => console.log('Test dialog confirmed'),
    });
}
