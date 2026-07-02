import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { MemoryRouter } from 'react-router-dom';

describe('App component', () => {
  test('renders login screen by default', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    const loginHeader = screen.getByText(/Enterprise Lifecycle Platform/i);
    expect(loginHeader).toBeInTheDocument();
    
    const signInButton = screen.getByRole('button', { name: /Sign In/i });
    expect(signInButton).toBeInTheDocument();
  });
});

