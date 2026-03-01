export interface Loan {
  id: string;
  applicantId: string;
  amount: number;
  apr: number;
  termMonths: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface LoanApplication {
  applicantName: string;
  monthlyIncome: number;
  creditScore: number;
  requestedAmount: number;
  precioUnidad: number;
}
