import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
});

export const simulateLoan = (loanData) => {
  return api.post('/api/v1/loans/simulate', loanData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
