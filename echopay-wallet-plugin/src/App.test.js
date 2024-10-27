import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the main heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/EchoPay Wallet Plugin Prototype/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders input field for recipient address', () => {
  render(<App />);
  const inputElement = screen.getByPlaceholderText(/Enter recipient address/i);
  expect(inputElement).toBeInTheDocument();
});

test('renders check balance button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Check Balance/i);
  expect(buttonElement).toBeInTheDocument();
});
