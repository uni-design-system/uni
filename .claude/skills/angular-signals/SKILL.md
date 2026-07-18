---
name: angular-signals
description: Expert architectural patterns for Angular v21+ Signals and Signal Forms. Use whenever creating or modifying Angular components, templates, data-fetching, or forms.
user-invocable: true
disable-model-invocation: false
---

# Angular 21+ Signals & Signal Forms Coding Standards

## 1. Input & Output Signals
* **Inputs:** Never use the legacy `@Input()` decorator. Use `input()` or `input.required()` primitives.
    * Example: `id = input.required<string>();`
* **Outputs:** Never use `@Output()`. Use the `output()` function.
    * Example: `save = output<User>();`

## 2. Resource Signals (Data Fetching)
* Never use traditional `HttpClient` subscriptions or manual RxJS mappings inside components for standard API fetches.
* Use `httpResource()` or the `resource()` primitive for asynchronous data loading.
* Example:
  ```ts
  userData = httpResource(() => `/api/users/${this.id()}`);
  ```

## 3. Local State & Transformations
* Use `signal()` for writable state.
* Use `computed()` for read-only derived state.
* Use `linkedSignal()` when a writable state needs to automatically reset or re-evaluate based on another upstream signal changing.

## 4. Signal Forms Pattern (Angular 21+)
Do not use `ReactiveFormsModule`, `FormGroup`, `FormControl`, or `ControlValueAccessor` for new features. Angular 21 standardizes on **Signal Forms**, treating a plain data object wrapped in a signal as the single source of truth.

### Form Architecture Rules:
1. **Model Source of Truth:** Define the form data structure inside a standard writable `signal()`.
2. **Form Translation:** Pass the state signal to the `form()` function to generate a reactive field tree.
3. **Declarative Validation:** Define validation rules using centralized schemas passed directly as the second argument of the `form()` function.
4. **Template Directives:** Bind inputs to fields using the generic `[field]` directive instead of legacy syntax.

### Component Implementation Example:
```ts
import { Component, signal } from '@angular/core';
import { form, required, email, minLength } from '@angular/forms/signals';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [], // Signal Forms directives auto-import or use shared forms provider
  templateUrl: './user-form.component.html'
})
export class UserFormComponent {
  // 1. Plain data model inside a Writable Signal
  formState = signal({
    email: '',
    password: ''
  });

  // 2. Build the reactive form tree & schema-based validation
  userForm = form(this.formState, {
    email: [required(), email()],
    password: [required(), minLength(8)]
  });

  onSubmit() {
    if (this.userForm.valid()) {
      // Data is always up-to-date in the source signal
      console.log('Submitting data:', this.formState()); 
    }
  }
}
```

### Template HTML Example:
```html
<form (submit)="onSubmit()">
  <div>
    <label>Email</label>
    <!-- Use [field] for two-way synchronization -->
    <input [field]="userForm.fields.email" type="email" />
    
    @if (userForm.fields.email.errors().required) {
      <p class="error">Email is required.</p>
    }
  </div>

  <div>
    <label>Password</label>
    <input [field]="userForm.fields.password" type="password" />
    
    @if (userForm.fields.password.touched() && userForm.fields.password.errors().minLength) {
      <p class="error">Password must be at least 8 characters.</p>
    }
  </div>

  <button type="submit" [disabled]="!userForm.valid()">Submit</button>
</form>
```

## 5. Templates & Native Control Flow
* Always use native control flow (`@if`, `@for`, `@switch`).
* Never use legacy structural directives like `*ngIf` or `*ngFor`.
