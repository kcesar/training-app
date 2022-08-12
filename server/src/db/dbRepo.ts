import { CompletionRow } from './completionRow';

export default class DBRepo {
  async getCompleted(traineeEmail: string) {
    const rows = await CompletionRow.findAll({ where: { traineeEmail }});
    return rows;
  }
}