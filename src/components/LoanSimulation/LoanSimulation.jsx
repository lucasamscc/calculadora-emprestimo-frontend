import React, { useState } from 'react';
import { simulateLoan } from '../../services/api';
import './LoanSimulation.css';

const LoanSimulation = () => {
  const [formData, setFormData] = useState({
    loanStartDate: '',
    loanEndDate: '',
    firstPaymentDate: '',
    principalAmount: '',
    interestRate: ''
  });

  const [installments, setInstallments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateDates = () => {
    const { loanStartDate, loanEndDate, firstPaymentDate } = formData;
    if (!loanStartDate || !loanEndDate || !firstPaymentDate) return false;

    if (loanEndDate <= loanStartDate) {
      setError('A data final deve ser maior que a data inicial.');
      return false;
    }
    if (firstPaymentDate <= loanStartDate) {
      setError('A data do primeiro pagamento deve ser maior que a data inicial.');
      return false;
    }
    if (firstPaymentDate >= loanEndDate) {
      setError('A data do primeiro pagamento deve ser menor que a data final.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateDates()) return;

    setIsLoading(true);

    try {
      const response = await simulateLoan({
        ...formData,
        principalAmount: parseFloat(formData.principalAmount),
        interestRate: Number((parseFloat(formData.interestRate) / 100).toFixed(6))
      });
      setInstallments(response.data || []);
    } catch (error) {
      console.error("Erro na simulação:", error);
      alert("Erro ao calcular empréstimo");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="loan-calculator-container">
      <h1>Calculadora de Empréstimos</h1>
      <form onSubmit={handleSubmit} className="loan-form">
        <div className="form-row">
          <div className="form-group">
            <label>Data Inicial</label>
            <input
              type="date"
              name="loanStartDate"
              value={formData.loanStartDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Data Final</label>
            <input
              type="date"
              name="loanEndDate"
              value={formData.loanEndDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Primeiro Pagamento</label>
            <input
              type="date"
              name="firstPaymentDate"
              value={formData.firstPaymentDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Valor do Empréstimo (R$)</label>
            <input
              type="number"
              name="principalAmount"
              value={formData.principalAmount}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label>Taxa de Juros (%)</label>
            <input
              type="number"
              name="interestRate"
              value={formData.interestRate}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Calculando...' : 'Calcular Empréstimo'}
        </button>
      </form>
      {installments.length > 0 && (
        <div className="table-container">
          <h2>Detalhamento das Parcelas</h2>
          <table className="installment-table">
            <thead>
              <tr>
                <th colSpan={3} style={{ textAlign: 'center' }}>Empréstimo</th>
                <th colSpan={2} style={{ textAlign: 'center' }}>Parcela</th>
                <th colSpan={5} style={{ textAlign: 'center' }}>Principal</th>
              </tr>
              <tr>
                <th>Data Competência</th>
                <th>Valor de Empréstimo</th>
                <th>Saldo Devedor</th>
                <th>Consolidada</th>
                <th>Valor Parcela Total</th>
                <th>Amortização</th>
                <th>Saldo</th>
                <th>Provisão</th>
                <th>Juros Acum.</th>
                <th>Valor Pago</th>
              </tr>
            </thead>
            <tbody>
              {installments.map((installment, index) => (
                <tr key={index}>
                  <td>{formatDate(installment.dueDate)}</td>
                  <td>{formatCurrency(installment.principalAmount)}</td>
                  <td>{formatCurrency(installment.outstandingBalance)}</td>
                  <td>{installment.installmentNumber}</td>
                  <td>{formatCurrency(installment.installmentValue)}</td>
                  <td>{formatCurrency(installment.principal)}</td>
                  <td>{formatCurrency(installment.balance)}</td>
                  <td>{formatCurrency(installment.provision)}</td>
                  <td>{formatCurrency(installment.accruedInterest)}</td>
                  <td>{formatCurrency(installment.interestPaid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LoanSimulation;