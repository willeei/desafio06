import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  title: string;
  type: 'income' | 'outcome';
  category: string;
  value: number;
}

interface TransactionResponse extends RequestDTO {
  id: string;
}
class CreateTransactionService {
  public async execute({
    title,
    type,
    category: categoryTitle,
    value,
  }: RequestDTO): Promise<TransactionResponse> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);
    const balance = await transactionRepository.getBalance();
    let category;

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Insufficient funds');
    }

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid operation type');
    }

    category = await categoryRepository.findOne({
      where: { title: categoryTitle },
    });

    if (!category) {
      category = { title: categoryTitle };
      await categoryRepository.save(category);
    }

    const { id } = await transactionRepository.save({
      title,
      type,
      value,
      category_id: category.id,
    });

    const transaction = {
      id,
      title,
      value,
      type,
      category: categoryTitle,
    };

    return transaction;
  }
}

export default CreateTransactionService;
