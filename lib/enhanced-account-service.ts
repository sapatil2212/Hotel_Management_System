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
  isModification?: boolean;
  originalAmount?: number;
  modificationReason?: string;
}

export interface UserAccountBalance {
  accountId: string;
  accountName: string;
  accountType: string;
  balance: number;
  isActive: boolean;
  userId?: string;
  userName?: string;
  isMainAccount: boolean;
}

export interface RevenueAllocation {
  totalAmount: number;
  breakdown: {
    accommodation: number;
    foodBeverage: number;
    spa: number;
    transport: number;
    laundry: number;
    minibar: number;
    conference: number;
    other: number;
  };
}

export class EnhancedAccountService {
  /**
   * Create user-specific bank account when user registers
   */
  static async createUserAccount(
    userId: string,
    userName: string,
    initialBalance: number = 0
  ): Promise<any> {
    try {
      const accountName = `${userName}'s Account`;
      
      const account = await prisma.bank_account.create({
        data: {
          accountName,
          accountType: 'current',
          balance: initialBalance,
          userId,
          isMainAccount: false,
          isActive: true,
        },
      });

      // Create initial transaction if balance > 0
      if (initialBalance > 0) {
        await this.addTransaction(account.id, {
          type: 'credit',
          category: 'transfer_in',
          amount: initialBalance,
          description: 'Initial account setup',
          referenceType: 'adjustment',
          processedBy: userId,
          notes: 'Account opening balance',
        });
      }

      return account;
    } catch (error) {
      console.error('Error creating user account:', error);
      throw error;
    }
  }

  /**
   * Get or create main hotel account
   */
  static async getOrCreateMainAccount(): Promise<any> {
    try {
      let mainAccount = await prisma.bank_account.findFirst({
        where: {
          isMainAccount: true,
          isActive: true,
        },
      });

      if (!mainAccount) {
        mainAccount = await prisma.bank_account.create({
          data: {
            accountName: 'Main Hotel Account',
            accountType: 'main',
            balance: 0,
            isMainAccount: true,
            isActive: true,
          },
        });
      }

      return mainAccount;
    } catch (error) {
      console.error('Error getting/creating main account:', error);
      throw error;
    }
  }

  /**
   * Get or create a user-specific bank account
   */
  static async getOrCreateUserAccount(userId: string): Promise<any> {
    try {
      let account = await prisma.bank_account.findFirst({
        where: {
          userId,
          isActive: true,
        },
      });

      if (!account) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true },
        });

        const userName = user?.name || 'User';
        account = await this.createUserAccount(userId, userName, 0);
      }

      return account;
    } catch (error) {
      console.error('Error getting/creating user account:', error);
      throw error;
    }
  }

  /**
   * Process payment revenue with user allocation
   */
  static async processPaymentRevenue(
    bookingId: string,
    totalAmount: number,
    revenueBreakdown: RevenueAllocation['breakdown'],
    paymentMethod: string,
    receivedBy: string,
    guestUserId?: string // User who made the booking
  ): Promise<void> {
    try {
      // Get main account
      const mainAccount = await this.getOrCreateMainAccount();
      
      // Get or create user account if guest user ID provided
      let userAccount = null;
      if (guestUserId) {
        userAccount = await prisma.bank_account.findFirst({
          where: {
            userId: guestUserId,
            isActive: true,
          },
        });

        if (!userAccount) {
          const user = await prisma.user.findUnique({
            where: { id: guestUserId },
            select: { name: true },
          });
          
          if (user) {
            userAccount = await this.createUserAccount(guestUserId, user.name);
          }
        }
      }

      await prisma.$transaction(async (tx) => {
        // Add to main account
        await tx.bank_account.update({
          where: { id: mainAccount.id },
          data: {
            balance: {
              increment: totalAmount,
            },
          },
        });

        // Add to user account if exists
        if (userAccount) {
          await tx.bank_account.update({
            where: { id: userAccount.id },
            data: {
              balance: {
                increment: totalAmount,
              },
            },
          });

          // Create user account transaction
          await tx.transaction.create({
            data: {
              accountId: userAccount.id,
              type: 'credit',
              category: 'accommodation_revenue',
              amount: totalAmount,
              description: `Revenue from booking ${bookingId}`,
              referenceId: bookingId,
              referenceType: 'booking',
              paymentMethod: paymentMethod as any,
              processedBy: receivedBy,
              notes: 'Revenue allocation to user account',
              transactionDate: new Date(),
            },
          });
        }

        // Create detailed transactions for main account based on service breakdown
        for (const [category, amount] of Object.entries(revenueBreakdown)) {
          if (amount > 0) {
            const categoryMapping: Record<string, string> = {
              accommodation: 'accommodation_revenue',
              foodBeverage: 'food_beverage_revenue',
              spa: 'spa_revenue',
              transport: 'transport_revenue',
              laundry: 'laundry_revenue',
              minibar: 'minibar_revenue',
              conference: 'other_services_revenue',
              other: 'other_services_revenue',
            };

            await this.addTransaction(mainAccount.id, {
              type: 'credit',
              category: categoryMapping[category] || 'other_services_revenue',
              amount,
              description: `${category} revenue from booking ${bookingId}`,
              referenceId: bookingId,
              referenceType: 'booking',
              paymentMethod,
              processedBy: receivedBy,
              notes: `Category: ${category}`,
            });
          }
        }
      }, {
        timeout: 15000, // Increase timeout to 15 seconds
      });
    } catch (error) {
      console.error('Error processing payment revenue:', error);
      throw error;
    }
  }

  /**
   * Process payment modification with proper audit trail
   */
  static async processPaymentModification(
    bookingId: string,
    originalAmount: number,
    newAmount: number,
    reason: string,
    processedBy: string,
    guestUserId?: string
  ): Promise<void> {
    try {
      const difference = newAmount - originalAmount;
      const mainAccount = await this.getOrCreateMainAccount();
      
      let userAccount = null;
      if (guestUserId) {
        userAccount = await prisma.bank_account.findFirst({
          where: {
            userId: guestUserId,
            isActive: true,
          },
        });
      }

      await prisma.$transaction(async (tx) => {
        if (difference !== 0) {
          const transactionType: 'credit' | 'debit' = difference > 0 ? 'credit' : 'debit';
          const absoluteDifference = Math.abs(difference);

          // Update main account
          await tx.bank_account.update({
            where: { id: mainAccount.id },
            data: {
              balance: {
                [difference > 0 ? 'increment' : 'decrement']: absoluteDifference,
              },
            },
          });

          // Update user account if exists
          if (userAccount) {
            await tx.bank_account.update({
              where: { id: userAccount.id },
              data: {
                balance: {
                  [difference > 0 ? 'increment' : 'decrement']: absoluteDifference,
                },
              },
            });

            // Create modification transaction for user account
            await this.addTransaction(userAccount.id, {
              type: transactionType,
              category: 'accommodation_revenue',
              amount: absoluteDifference,
              description: `Payment modification for booking ${bookingId}`,
              referenceId: bookingId,
              referenceType: 'booking',
              processedBy,
              notes: reason,
              isModification: true,
              originalAmount,
            });
          }

          // Create modification transaction for main account
          await this.addTransaction(mainAccount.id, {
            type: transactionType,
            category: 'accommodation_revenue',
            amount: absoluteDifference,
            description: `Payment modification for booking ${bookingId}`,
            referenceId: bookingId,
            referenceType: 'booking',
            processedBy,
            notes: reason,
            isModification: true,
            originalAmount,
            modificationReason: reason,
          });
        }
      });
    } catch (error) {
      console.error('Error processing payment modification:', error);
      throw error;
    }
  }

  /**
   * Get all user accounts with balances
   */
  static async getAllUserAccounts(): Promise<UserAccountBalance[]> {
    try {
      const accounts = await prisma.bank_account.findMany({
        where: {
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { isMainAccount: 'desc' },
          { accountName: 'asc' },
        ],
      });

      return accounts.map(account => ({
        accountId: account.id,
        accountName: account.accountName,
        accountType: account.accountType,
        balance: account.balance,
        isActive: account.isActive,
        userId: account.userId || undefined,
        userName: account.user?.name || undefined,
        isMainAccount: account.isMainAccount,
      }));
    } catch (error) {
      console.error('Error fetching user accounts:', error);
      throw error;
    }
  }

  /**
   * Get user-specific account balance
   */
  static async getUserAccountBalance(userId: string): Promise<UserAccountBalance | null> {
    try {
      const account = await prisma.bank_account.findFirst({
        where: {
          userId,
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!account) {
        return null;
      }

      return {
        accountId: account.id,
        accountName: account.accountName,
        accountType: account.accountType,
        balance: account.balance,
        isActive: account.isActive,
        userId: account.userId || undefined,
        userName: account.user?.name || undefined,
        isMainAccount: account.isMainAccount,
      };
    } catch (error) {
      console.error('Error fetching user account balance:', error);
      throw error;
    }
  }

  /**
   * Credit bill amount to staff member who collected it
   */
  static async creditBillToStaff(
    billAmount: number,
    staffMemberName: string,
    bookingId: string,
    paymentMethod: string,
    billReferenceNumber?: string
  ): Promise<{
    transaction: any;
    staffAccount: any;
    referenceNumber: string;
  }> {
    try {
      // Find staff member by name
      const staffUser = await prisma.user.findFirst({
        where: {
          name: staffMemberName,
        },
      });

      if (!staffUser) {
        throw new Error(`Staff member "${staffMemberName}" not found`);
      }

      // Get or create staff member's bank account
      let staffAccount = await this.getOrCreateUserAccount(staffUser.id);

      // Generate reference number for this credit
      const referenceNumber = billReferenceNumber || `BILL-CREDIT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Use a simple transaction to credit account and create record
      const transaction = await prisma.$transaction(async (tx) => {
        // Credit the amount to staff account
        await tx.bank_account.update({
          where: { id: staffAccount.id },
          data: {
            balance: {
              increment: billAmount,
            },
            updatedAt: new Date(),
          },
        });

        // Create transaction record
        return await tx.transaction.create({
          data: {
            accountId: staffAccount.id,
            type: 'credit',
            category: 'accommodation_revenue',
            amount: billAmount,
            description: `Bill collection commission - Booking ${bookingId}`,
            referenceId: bookingId,
            referenceType: 'booking',
            paymentMethod: paymentMethod as any,
            processedBy: staffMemberName,
            notes: `Bill amount credited to staff account. Reference: ${referenceNumber}`,
            transactionDate: new Date(),
          },
        });
      }, {
        timeout: 10000, // 10 second timeout for staff credit
      });

      // Get updated account
      const updatedStaffAccount = await prisma.bank_account.findUnique({
        where: { id: staffAccount.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return {
        transaction,
        staffAccount: updatedStaffAccount,
        referenceNumber,
      };
    } catch (error) {
      console.error('Error crediting bill to staff:', error);
      throw error;
    }
  }

  /**
   * Add transaction (inherited from AccountService)
   */
  static async addTransaction(accountId: string, transactionData: TransactionData): Promise<any> {
    try {
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
          isModification: transactionData.isModification || false,
          originalAmount: transactionData.originalAmount,
          modificationReason: transactionData.modificationReason,
        },
      });

      return transaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  /**
   * Add revenue directly to main hotel account (for invoice creation)
   */
  static async addRevenueToMainAccount(
    bookingId: string,
    totalAmount: number,
    revenueBreakdown: {
      accommodation: number;
      extraCharges: number;
      taxes: number;
    },
    paymentMethod: string,
    processedBy: string,
    description: string
  ): Promise<void> {
    try {
      const mainAccount = await this.getOrCreateMainAccount();
      
      await prisma.$transaction(async (tx) => {
        // Update main account balance
        await tx.bank_account.update({
          where: { id: mainAccount.id },
          data: {
            balance: {
              increment: totalAmount,
            },
          },
        });

        // Create ONE consolidated credit transaction with all details
        const consolidatedDescription = `Revenue from ${description}`;
        const detailedNotes = `Revenue Breakdown:
• Accommodation: ₹${revenueBreakdown.accommodation}
• Extra Charges: ₹${revenueBreakdown.extraCharges}
• Taxes: ₹${revenueBreakdown.taxes}
• Total: ₹${totalAmount}
• Payment Method: ${paymentMethod}
• Processed By: ${processedBy}
• Reference: ${bookingId}`;

        await tx.transaction.create({
          data: {
            accountId: mainAccount.id,
            type: 'credit',
            category: 'accommodation_revenue',
            amount: totalAmount,
            description: consolidatedDescription,
            referenceId: bookingId,
            referenceType: 'booking',
            paymentMethod: paymentMethod as any,
            processedBy: processedBy,
            notes: detailedNotes,
            transactionDate: new Date(),
          },
        });
      });

      // Revenue added successfully - silent operation
    } catch (error) {
      console.error('Error adding revenue to main account:', error);
      throw error;
    }
  }

  /**
   * Get transaction history with user filtering
   */
  static async getTransactionHistory(
    accountId?: string,
    userId?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 50,
    type?: string,
    category?: string
  ): Promise<any[]> {
    try {
      const where: any = {};

      if (accountId) {
        where.accountId = accountId;
      } else if (userId) {
        // Get user's account transactions
        const userAccount = await prisma.bank_account.findFirst({
          where: { userId, isActive: true },
        });
        
        if (userAccount) {
          where.accountId = userAccount.id;
        }
      }

      if (startDate && endDate) {
        where.transactionDate = {
          gte: startDate,
          lte: endDate,
        };
      }

      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          account: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          transactionDate: 'desc',
        },
        take: limit,
      });

      return transactions;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  /**
   * Manual deposit to account
   */
  static async manualDeposit(
    accountId: string,
    amount: number,
    description: string,
    processedBy: string,
    notes?: string,
    paymentMethod?: string
  ): Promise<any> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Get account details
        const account = await tx.bank_account.findUnique({
          where: { id: accountId },
          include: {
            user: {
              select: { name: true }
            }
          }
        });

        if (!account) {
          throw new Error('Account not found');
        }

        // Update account balance
        await tx.bank_account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: amount,
            },
          },
        });

        // Create deposit transaction
        const transaction = await this.addTransaction(accountId, {
          type: 'credit',
          category: 'transfer_in',
          amount,
          description: description || 'Manual deposit',
          referenceType: 'adjustment',
          paymentMethod: paymentMethod as any,
          processedBy,
          notes: notes || 'Manual deposit by staff',
        });

        return {
          transaction,
          account: {
            ...account,
            balance: account.balance + amount,
          },
        };
      });
    } catch (error) {
      console.error('Error processing manual deposit:', error);
      throw error;
    }
  }

  /**
   * Manual withdrawal from account
   */
  static async manualWithdrawal(
    accountId: string,
    amount: number,
    description: string,
    processedBy: string,
    notes?: string,
    paymentMethod?: string
  ): Promise<any> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Get account details
        const account = await tx.bank_account.findUnique({
          where: { id: accountId },
        });

        if (!account) {
          throw new Error('Account not found');
        }

        if (account.balance < amount) {
          throw new Error('Insufficient balance for withdrawal');
        }

        // Update account balance
        await tx.bank_account.update({
          where: { id: accountId },
          data: {
            balance: {
              decrement: amount,
            },
          },
        });

        // Create withdrawal transaction
        const transaction = await this.addTransaction(accountId, {
          type: 'debit',
          category: 'transfer_out',
          amount,
          description: description || 'Manual withdrawal',
          referenceType: 'adjustment',
          paymentMethod: paymentMethod as any,
          processedBy,
          notes: notes || 'Manual withdrawal by staff',
        });

        return {
          transaction,
          account: {
            ...account,
            balance: account.balance - amount,
          },
        };
      });
    } catch (error) {
      console.error('Error processing manual withdrawal:', error);
      throw error;
    }
  }

  /**
   * Transfer between accounts (existing functionality enhanced)
   */
  static async transferBetweenAccounts(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string,
    processedBy: string
  ): Promise<any> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Get source account balance
        const fromAccount = await tx.bank_account.findUnique({
          where: { id: fromAccountId },
        });

        if (!fromAccount || fromAccount.balance < amount) {
          throw new Error('Insufficient balance in source account');
        }

        // Update balances
        await tx.bank_account.update({
          where: { id: fromAccountId },
          data: {
            balance: {
              decrement: amount,
            },
          },
        });

        await tx.bank_account.update({
          where: { id: toAccountId },
          data: {
            balance: {
              increment: amount,
            },
          },
        });

        // Create debit transaction for source account
        const debitTransaction = await this.addTransaction(fromAccountId, {
          type: 'debit',
          category: 'transfer_out',
          amount,
          description: `Transfer to account: ${description}`,
          referenceType: 'transfer',
          processedBy,
          notes: `To account: ${toAccountId}`,
        });

        // Create credit transaction for destination account
        const creditTransaction = await this.addTransaction(toAccountId, {
          type: 'credit',
          category: 'transfer_in',
          amount,
          description: `Transfer from account: ${description}`,
          referenceType: 'transfer',
          processedBy,
          notes: `From account: ${fromAccountId}`,
        });

        return {
          debitTransaction,
          creditTransaction,
        };
      });
    } catch (error) {
      console.error('Error transferring between accounts:', error);
      throw error;
    }
  }
}
