import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionFormatted {
  id: string;
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const balance = (await this.find()).reduce(
      (a: Balance, b: Transaction): Balance => {
        const result = { ...a };
        result[b.type] += Number(b.value);
        result.total = result.income - result.outcome;
        return result;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return balance;
  }

  public async getTransactions(): Promise<TransactionFormatted[]> {
    const transactions = await this.find({
      relations: ['category'],
    }).then(result => {
      return result.map(transaction => ({
        id: transaction.id,
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: transaction.category.title,
      }));
    });

    return transactions;
  }
}

export default TransactionsRepository;
