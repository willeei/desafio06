import { resolve } from 'path';
import csv from 'csvtojson';

import CreateTransactionService from './CreateTransactionService';
import AppError from '../errors/AppError';

interface RequestDTO {
  filename: string;
}

interface RequestTransaction {
  title: string;
  type: 'income' | 'outcome';
  category: string;
  value: number;
}

class ImportTransactionsService {
  async execute({
    filename,
  }: RequestDTO): Promise<Partial<RequestTransaction>[]> {
    // const transactionRepository = getRepository(Transaction);
    const transactionService = new CreateTransactionService();
    const file = resolve(__dirname, '..', '..', 'tmp', filename);
    const json: RequestTransaction[] = await csv({
      trim: true,
      checkType: true,
    }).fromFile(file);
    const transactions: RequestTransaction[] = [];

    async function setTRansaction(index: number): Promise<null> {
      try {
        const transaction = await transactionService.execute(json[index]);
        transactions.push(transaction);
        if (index < json.length - 1) {
          return setTRansaction(index + 1);
        }
      } catch (error) {
        throw new AppError(error.message, error.status);
      }

      return null;
    }

    await setTRansaction(0);

    return transactions;
  }
}

export default ImportTransactionsService;
