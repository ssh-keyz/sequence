import { AuthService } from './services/auth';

class AuthHandler {
  private loginForm: HTMLFormElement | null;
  private registerForm: HTMLFormElement | null;

  constructor() {
    this.loginForm = document.querySelector<HTMLFormElement>('form[action="/auth/login"]');
    this.registerForm = document.querySelector<HTMLFormElement>('form[action="/auth/register"]');
    this.init();
  }

  private init(): void {
    this.loginForm?.addEventListener('submit', this.handleLogin.bind(this));
    this.registerForm?.addEventListener('submit', this.handleRegister.bind(this));
  }

  private async handleLogin(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password')
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const auth = await response.json();
      AuthService.setAuth(auth);
      window.location.href = '/lobby';
    } catch (err) {
      this.showError(form, err instanceof Error ? err.message : 'Login failed');
    }
  }

  private async handleRegister(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: formData.get('username'),
          email: formData.get('email'),
          password: formData.get('password')
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.errors?.[0]?.msg || 'Registration failed');
      }

      const auth = await response.json();
      AuthService.setAuth(auth);
      window.location.href = '/lobby';
    } catch (err) {
      this.showError(form, err instanceof Error ? err.message : 'Registration failed');
    }
  }

  private showError(form: HTMLFormElement, message: string): void {
    let errorDiv = form.querySelector('.error-message');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'error-message mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded';
      form.insertBefore(errorDiv, form.firstChild);
    }
    errorDiv.textContent = message;
  }
}

// Initialize auth handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AuthHandler();
}); 