import { addMonths, upsertAnamnese } from './index';
import { anamneseTable, anamneseItemsTable, employmentTable, examesTable } from '@/models/Schema';
import { db } from '@/libs/DB';
import { eq, and, not, isNull, sql } from 'drizzle-orm';

// Mock do módulo drizzle-orm
vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    eq: vi.fn(actual.eq),
    and: vi.fn(actual.and),
    not: vi.fn(actual.not),
    isNull: vi.fn(actual.isNull),
    sql: vi.fn(actual.sql),
  };
});



// Mock do next/cache para revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock do safe-action para simular autenticação
vi.mock('@/libs/safe-action', () => ({
  protectedClient: {
    schema: vi.fn((schema) => ({
      action: vi.fn((actionFn) => {
        return async (input: any) => {
          const parsedInput = schema.parse(input);
          const ctx = { orgId: 'test_org_id' }; // orgId fictício
          return actionFn({ parsedInput, ctx });
        };
      }),
    })),
  },
}));

// Mock do server-only
vi.mock('server-only', () => ({}));



describe('addMonths', () => {
  it('should add months correctly to a given date', () => {
    const date = new Date('2023-01-15T10:00:00.000Z');
    const newDate = addMonths(date, 3);
    expect(newDate.toISOString()).toBe('2023-04-15T10:00:00.000Z');
  });

  it('should handle adding months across year boundaries', () => {
    const date = new Date('2023-10-15T10:00:00.000Z');
    const newDate = addMonths(date, 4);
    expect(newDate.toISOString()).toBe('2024-02-15T10:00:00.000Z');
  });

  it('should handle adding zero months', () => {
    const date = new Date('2023-01-15T10:00:00.000Z');
    const newDate = addMonths(date, 0);
    expect(newDate.toISOString()).toBe('2023-01-15T10:00:00.000Z');
  });

  it('should handle negative months', () => {
    const date = new Date('2023-04-15T10:00:00.000Z');
    const newDate = addMonths(date, -3);
    expect(newDate.toISOString()).toBe('2023-01-15T10:00:00.000Z');
  });
});

describe('upsertAnamnese', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate vencto correctly for first exam', async () => {
    const input = {
      colaboradorId: 1,
      clienteId: 1,
      atendenteId: '1',
      data: new Date('2023-01-01'),
      formapagto: 'A VISTA',
      tipo: 'ADMISSIONAL',
      cargo: 'Desenvolvedor',
      items: [{
        exameId: 1,
        valor: 100,
        medicoId: 1,
      }],
    };

    vi.spyOn(db, 'transaction').mockImplementationOnce(async (callback) => {
      const mockReturning = vi.fn().mockReturnValue([{ id: 1, colaboradorId: 1, clienteId: 1, data: new Date() }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet });

      const mockOnConflictDoNothing = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockValues = vi.fn().mockReturnValue({ onConflictDoNothing: mockOnConflictDoNothing, returning: mockReturning });
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

      const mockLimit = vi.fn().mockReturnValue([{ v0: 12, v1: 6 }]);
      const mockWhereSelect = vi.fn((condition) => {
        if (condition.includes('examesTable.id')) {
          return { limit: mockLimit };
        } else {
          return { innerJoin: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue([{ cnt: 0 }]) }) };
        }
      });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhereSelect });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      const mockDeleteWhere = vi.fn().mockReturnValue({});
      const mockDelete = vi.fn().mockReturnValue({ where: mockDeleteWhere });

      const tx = {
        update: mockUpdate,
        insert: mockInsert,
        select: mockSelect,
        delete: mockDelete,
      };

      return callback(tx);
    });

    const result = await upsertAnamnese(input);

    // Verifica se o vencto foi calculado com base na validade inicial (v0)
    const expectedVencto = addMonths(new Date('2023-01-01'), 12).toISOString().slice(0, 10);
    expect(db.transaction).toHaveBeenCalled();
    expect((db.transaction as vi.Mock).mock.calls[0][0]().insert.mock.calls[1][0].vencto).toBe(expectedVencto);
  });

  it('should calculate vencto correctly for subsequent exams', async () => {
    const input = {
      colaboradorId: 1,
      clienteId: 1,
      atendenteId: '1',
      data: new Date('2023-01-01'),
      formapagto: 'A VISTA',
      tipo: 'ADMISSIONAL',
      cargo: 'Desenvolvedor',
      items: [{
        exameId: 1,
        valor: 100,
        medicoId: 1,
      }],
    };

    

    const result = await upsertAnamnese(input);

    // Verifica se o vencto foi calculado com base na validade secundária (v1)
    const expectedVencto = addMonths(new Date('2023-01-01'), 6).toISOString().slice(0, 10);
    expect(db.transaction).toHaveBeenCalled();
    expect((db.transaction as vi.Mock).mock.calls[0][0]().insert.mock.calls[1][0].vencto).toBe(expectedVencto);
  });

  it('should update employmentTable to set dataDemissao to null if re-admitted', async () => {
    const input = {
      colaboradorId: 1,
      clienteId: 1,
      atendenteId: '1',
      data: new Date('2023-01-01'),
      formapagto: 'A VISTA',
      tipo: 'ADMISSIONAL',
      cargo: 'Desenvolvedor',
      items: [{
        exameId: 1,
        valor: 100,
        medicoId: 1,
      }],
    };

    vi.spyOn(db, 'transaction').mockImplementationOnce(async (callback) => {
      const mockReturning = vi.fn().mockReturnValue([{ id: 1, colaboradorId: 1, clienteId: 1, data: new Date() }]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet });

      const mockOnConflictDoNothing = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockValues = vi.fn().mockReturnValue({ onConflictDoNothing: mockOnConflictDoNothing, returning: mockReturning });
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues });

      const mockLimit = vi.fn().mockReturnValue([{ v0: 12, v1: 6 }]);
      const mockWhereSelect = vi.fn((condition) => {
        if (condition.includes('examesTable.id')) {
          return { limit: mockLimit };
        } else {
          return { innerJoin: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue([{ cnt: 0 }]) }) };
        }
      });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhereSelect });
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });

      const mockDeleteWhere = vi.fn().mockReturnValue({});
      const mockDelete = vi.fn().mockReturnValue({ where: mockDeleteWhere });

      const tx = {
        update: mockUpdate,
        insert: mockInsert,
        select: mockSelect,
        delete: mockDelete,
      };

      return callback(tx);
    });

    await upsertAnamnese(input);

    // Verifica se o update foi chamado para employmentTable com dataDemissao = null
    expect(db.transaction).toHaveBeenCalled();
    expect((db.transaction as vi.Mock).mock.calls[0][0]().update).toHaveBeenCalledWith(employmentTable);
    expect((db.transaction as vi.Mock).mock.calls[0][0]().update.mock.calls[0][0]).toBe(employmentTable);
    expect((db.transaction as vi.Mock).mock.calls[0][0]().update.mock.calls[0][1]).toEqual({ dataDemissao: null, updatedAt: expect.any(Date) });
  });
});

    

    
