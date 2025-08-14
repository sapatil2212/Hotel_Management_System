import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';

const prisma = new PrismaClient();

export interface TransactionData {
  type: 'credit' | 'debit';
  category: string;
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: 'booking' | 'invoice' | 'payment' | 'expense' | 'transfer' | 'adjustment' | 'refund';
  paymentMethod?: string;
  processedBy?: string;
  notes?: string;
  transactionDate?: Date;
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  accountType: string;
  balance: number;
  isActive: boolean;
}

export interface TransactionSummary {
  totalCredits: number;
  totalDebits: number;
  netAmount: number;
  transactionCount: number;
  creditCount: number;
  debitCount: number;
}

export interface CategoryBreakdown {
  category: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export class AccountService {
  /**
   * Create a new bank account
   */
  static async createAccount(
    accountName: string,
    accountType: 'main' | 'petty_cash' | 'online_payments' | 'savings' | 'current' = 'main',
    accountNumber?: string,
    bankName?: string,
    initialBalance: number = 0
  ): Promise<any> {
    try {
      const account = await prisma.bank_account.create({
        data: {
          accountName,
          accountType,
          accountNumber,
          bankName,
          balance: initialBalance,
          updatedAt: new Date(),
        },
      });

      // If initial balance > 0, create an opening balance transaction
      if (initialBalance > 0) {
        await this.addTransaction(account.id, {
          type: 'credit',
          category: 'transfer_in',
          amount: initialBalance,
          description: 'Opening Balance',
          notes: 'Initial account setup with opening balance',
          processedBy: 'System',
        });
      }

      return account;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  /**
   * Add a transaction to an account
   */
  static async addTransaction(accountId: string, transactionData: TransactionData): Promise<any> {
    try {
      // Get current account balance
      const account = await prisma.bank_account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new Error('Account not found');
      }

      if (!account.isActive) {
        throw new Error('Account is inactive');
      }

      // Calculate new balance
      const balanceChange = transactionData.type === 'credit' 
        ? transactionData.amount 
        : -transactionData.amount;
      
      const newBalance = account.balance + balanceChange;

      // Check for negative balance (optional business rule)
      if (newBalance < 0 && account.accountType === 'savings') {
        throw new Error('Insufficient funds in savings account');
      }

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          accountId,
          type: transactionData.type,
          category: transactionData.category as any,
          amount: transactionData.amount,
          description: transactionData.description,
          referenceId: transactionData.referenceId,
          referenceType: transactionData.referenceType as any,
          paymentMethod: transactionData.paymentMethod as any,
          processedBy: transactionData.processedBy,
          notes: transactionData.notes,
          transactionDate: transactionData.transactionDate || new Date(),
          updatedAt: new Date(),
        },
      });

      // Update account balance
      await prisma.bank_account.update({
        where: { id: accountId },
        data: { 
          balance: newBalance,
          updatedAt: new Date(),
        },
      });

      return transaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  /**
   * Process payment revenue - automatically categorize and add to main account
   */
  static async processPaymentRevenue(
    bookingId: string,
    totalAmount: number,
    serviceBreakdown: {
      accommodation: number;
      foodBeverage: number;
      spa: number;
      transport: number;
      laundry: number;
      minibar: number;
      other: number;
    },
    paymentMethod: string,
    processedBy: string
  ): Promise<any[]> {
    try {
      // Get main account
      const mainAccount = await this.getMainAccount();
      const transactions = [];

      // Add accommodation revenue
      if (serviceBreakdown.accommodation > 0) {
        const transaction = await this.addTransaction(mainAccount.id, {
          type: 'credit',
          category: 'accommodation_revenue',
          amount: serviceBreakdown.accommodation,
          description: `Room charges for booking ${bookingId}`,
          referenceId: bookingId,
          referenceType: 'booking',
          paymentMethod,
          processedBy,
          notes: `Accommodation revenue from guest payment`,
        });
        transactions.push(transaction);
      }

      // Add service revenues
      const serviceCategories = [
        { key: 'foodBeverage', category: 'food_beverage_revenue', name: 'Food & Beverage' },
        { key: 'spa', category: 'spa_revenue', name: 'Spa Services' },
        { key: 'transport', category: 'transport_revenue', name: 'Transport Services' },
        { key: 'laundry', category: 'laundry_revenue', name: 'Laundry Services' },
        { key: 'minibar', category: 'minibar_revenue', name: 'Minibar' },
        { key: 'other', category: 'other_services_revenue', name: 'Other Services' },
      ];

      for (const service of serviceCategories) {
        const amount = serviceBreakdown[service.key as keyof typeof serviceBreakdown];
        if (amount > 0) {
          const transaction = await this.addTransaction(mainAccount.id, {
            type: 'credit',
            category: service.category,
            amount: amount,
            description: `${service.name} charges for booking ${bookingId}`,
            referenceId: bookingId,
            referenceType: 'booking',
            paymentMethod,
            processedBy,
            notes: `${service.name} revenue from guest payment`,
          });
          transactions.push(transaction);
        }
      }

      return transactions;
    } catch (error) {
      console.error('Error processing payment revenue:', error);
      throw error;
    }
  }

  /**
   * Reverse payment revenue when payment status changes from paid to pending
   */
  static async reversePaymentRevenue(
    bookingId: string,
    totalAmount: number,
    originalServiceBreakdown: {
      accommodation: number;
      foodBeverage: number;
      spa: number;
      transport: number;
      laundry: number;
      minibar: number;
      other: number;
    },
    processedBy: string
  ): Promise<any[]> {
    try {
      const mainAccount = await this.getMainAccount();
      const transactions = [];

      // Reverse accommodation revenue
      if (originalServiceBreakdown.accommodation > 0) {
        const transaction = await this.addTransaction(mainAccount.id, {
          type: 'debit',
          category: 'refunds',
          amount: originalServiceBreakdown.accommodation,
          description: `Reversed accommodation charges for booking ${bookingId}`,
          referenceId: bookingId,
          referenceType: 'booking',
          processedBy,
          notes: `Revenue reversal - payment status changed to pending`,
        });
        transactions.push(transaction);
      }

      // Reverse service revenues
      const serviceCategories = [
        { key: 'foodBeverage', name: 'Food & Beverage' },
        { key: 'spa', name: 'Spa Services' },
        { key: 'transport', name: 'Transport Services' },
        { key: 'laundry', name: 'Laundry Services' },
        { key: 'minibar', name: 'Minibar' },
        { key: 'other', name: 'Other Services' },
      ];

      for (const service of serviceCategories) {
        const amount = originalServiceBreakdown[service.key as keyof typeof originalServiceBreakdown];
        if (amount > 0) {
          const transaction = await this.addTransaction(mainAccount.id, {
            type: 'debit',
            category: 'refunds',
            amount: amount,
            description: `Reversed ${service.name} charges for booking ${bookingId}`,
            referenceId: bookingId,
            referenceType: 'booking',
            processedBy,
            notes: `Revenue reversal - payment status changed to pending`,
          });
          transactions.push(transaction);
        }
      }

      return transactions;
    } catch (error) {
      console.error('Error reversing payment revenue:', error);
      throw error;
    }
  }

  /**
   * Add expense transaction
   */
  static async addExpense(
    category: string,
    amount: number,
    description: string,
    processedBy: string,
    paymentMethod?: string,
    notes?: string,
    accountId?: string
  ): Promise<any> {
    try {
      const account = accountId 
        ? await prisma.bank_account.findUnique({ where: { id: accountId } })
        : await this.getMainAccount();

      if (!account) {
        throw new Error('Account not found');
      }

      return await this.addTransaction(account.id, {
        type: 'debit',
        category,
        amount,
        description,
        referenceType: 'expense',
        paymentMethod,
        processedBy,
        notes,
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  /**
   * Get main account (create if doesn't exist)
   */
  static async getMainAccount(): Promise<any> {
    try {
      let mainAccount = await prisma.bank_account.findFirst({
        where: { accountType: 'main', isActive: true },
      });

      if (!mainAccount) {
        mainAccount = await this.createAccount(
          'Main Hotel Account',
          'main',
          undefined,
          'Hotel Management System',
          0
        );
      }

      return mainAccount;
    } catch (error) {
      console.error('Error getting main account:', error);
      throw error;
    }
  }

  /**
   * Get all account balances
   */
  static async getAllAccountBalances(): Promise<AccountBalance[]> {
    try {
      const accounts = await prisma.bank_account.findMany({
        where: { isActive: true },
        orderBy: { accountName: 'asc' },
      });

      return accounts.map(account => ({
        accountId: account.id,
        accountName: account.accountName,
        accountType: account.accountType,
        balance: account.balance,
        isActive: account.isActive,
      }));
    } catch (error) {
      console.error('Error getting account balances:', error);
      throw error;
    }
  }

  /**
   * Get transaction summary for a period
   */
  static async getTransactionSummary(
    startDate: Date,
    endDate: Date,
    accountId?: string
  ): Promise<TransactionSummary> {
    try {
      const whereClause: any = {
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (accountId) {
        whereClause.accountId = accountId;
      }

      const transactions = await prisma.transaction.findMany({
        where: whereClause,
      });

      const credits = transactions.filter(t => t.type === 'credit');
      const debits = transactions.filter(t => t.type === 'debit');

      const totalCredits = credits.reduce((sum, t) => sum + t.amount, 0);
      const totalDebits = debits.reduce((sum, t) => sum + t.amount, 0);

      return {
        totalCredits,
        totalDebits,
        netAmount: totalCredits - totalDebits,
        transactionCount: transactions.length,
        creditCount: credits.length,
        debitCount: debits.length,
      };
    } catch (error) {
      console.error('Error getting transaction summary:', error);
      throw error;
    }
  }

  /**
   * Get revenue breakdown by category
   */
  static async getRevenueBreakdown(
    startDate: Date,
    endDate: Date,
    accountId?: string
  ): Promise<CategoryBreakdown[]> {
    try {
      const whereClause: any = {
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
        type: 'credit',
      };

      if (accountId) {
        whereClause.accountId = accountId;
      }

      const transactions = await prisma.transaction.groupBy({
        by: ['category'],
        where: whereClause,
        _sum: {
          amount: true,
        },
        _count: {
          category: true,
        },
      });

      const totalRevenue = transactions.reduce((sum, t) => sum + (t._sum.amount || 0), 0);

      return transactions.map(t => ({
        category: t.category,
        totalAmount: t._sum.amount || 0,
        transactionCount: t._count.category,
        percentage: totalRevenue > 0 ? ((t._sum.amount || 0) / totalRevenue) * 100 : 0,
      }));
    } catch (error) {
      console.error('Error getting revenue breakdown:', error);
      throw error;
    }
  }

  /**
   * Get recent transactions
   */
  static async getRecentTransactions(
    limit: number = 50,
    accountId?: string
  ): Promise<any[]> {
    try {
      const whereClause: any = {};
      if (accountId) {
        whereClause.accountId = accountId;
      }

      return await prisma.transaction.findMany({
        where: whereClause,
        include: {
          account: {
            select: {
              accountName: true,
              accountType: true,
            },
          },
        },
        orderBy: {
          transactionDate: 'desc',
        },
        take: limit,
      });
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      throw error;
    }
  }

  /**
   * Transfer between accounts
   */
  static async transferBetweenAccounts(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string,
    processedBy: string
  ): Promise<{ debitTransaction: any; creditTransaction: any }> {
    try {
      // Debit from source account
      const debitTransaction = await this.addTransaction(fromAccountId, {
        type: 'debit',
        category: 'transfer_out',
        amount,
        description: `Transfer to account: ${description}`,
        referenceType: 'transfer',
        processedBy,
        notes: `Account transfer - outgoing`,
      });

      // Credit to destination account
      const creditTransaction = await this.addTransaction(toAccountId, {
        type: 'credit',
        category: 'transfer_in',
        amount,
        description: `Transfer from account: ${description}`,
        referenceType: 'transfer',
        processedBy,
        notes: `Account transfer - incoming`,
      });

      return { debitTransaction, creditTransaction };
    } catch (error) {
      console.error('Error transferring between accounts:', error);
      throw error;
    }
  }

  /**
   * Get daily cash flow
   */
  static async getDailyCashFlow(days: number = 30): Promise<any[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const transactions = await prisma.transaction.findMany({
        where: {
          transactionDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          transactionDate: 'asc',
        },
      });

      // Group by date
      const dailyFlow: { [key: string]: { credits: number; debits: number; net: number } } = {};

      transactions.forEach(transaction => {
        const date = format(transaction.transactionDate, 'yyyy-MM-dd');
        
        if (!dailyFlow[date]) {
          dailyFlow[date] = { credits: 0, debits: 0, net: 0 };
        }

        if (transaction.type === 'credit') {
          dailyFlow[date].credits += transaction.amount;
        } else {
          dailyFlow[date].debits += transaction.amount;
        }

        dailyFlow[date].net = dailyFlow[date].credits - dailyFlow[date].debits;
      });

      return Object.entries(dailyFlow).map(([date, flow]) => ({
        date,
        ...flow,
      }));
    } catch (error) {
      console.error('Error getting daily cash flow:', error);
      throw error;
    }
  }
}

