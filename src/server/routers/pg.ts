import { t } from '../trpc';
import { z } from 'zod';
import { inferProcedureOutput, TRPCError } from '@trpc/server';
import { PostgresMeta } from '@/postgres-meta/index';
import { DEFAULT_POOL_CONFIG, PG_CONNECTION } from '@/constants/postgres-meta';

export const pgRouter = t.router({
  tables: t.procedure.query(async ({ ctx }) => {
    const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString: PG_CONNECTION });
    const { data, error } = await pgMeta.tables.list({
      includeSystemSchemas: false,
      includeColumns: false,
      excludedSchemas: ['pg_catalog', 'information_schema', 'hdb_catalog']
    });
    await pgMeta.end();
    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }
    return data
      .filter((item) => item.name !== 't_sql_meta_enum')
      .map((item) => {
        return {
          tableId: item.id,
          tableSchema: item.schema,
          tableName: item.name
        };
      });
  }),
  createTable: t.procedure
    .input(
      z.object({
        schema: z.string(),
        name: z.string(),
        comment: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString: PG_CONNECTION });
      const { data, error } = await pgMeta.tables.create({
        schema: input.schema,
        name: input.name,
        comment: input.comment
      });
      await pgMeta.end();
      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      return data;
    }),
  updateTable: t.procedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        rls_enabled: z.boolean().optional(),
        rls_forced: z.boolean().optional(),
        replica_identity: z
          .string(
            z.custom((val) => {
              if (val === 'DEFAULT' || val === 'FULL' || val === 'INDEX' || val === 'NOTHING') {
                return true;
              }
              return false;
            })
          )
          .optional(),
        replica_identity_index: z.string().optional(),
        primary_keys: z.optional(
          z.array(
            z.object({
              name: z.string()
            })
          )
        ),
        comment: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString: PG_CONNECTION });
      const { data, error } = await pgMeta.tables.update(input.id, {
        name: input.name,
        rls_enabled: input.rls_enabled,
        rls_forced: input.rls_forced,
        // @ts-ignore
        replica_identity: input.replica_identity,
        replica_identity_index: input.replica_identity_index,
        // @ts-ignore
        primary_keys: input.primary_keys,
        comment: input.comment
      });
      await pgMeta.end();
      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      return data;
    }),
  deleteTable: t.procedure
    .input(
      z.object({
        tableId: z.number(),
        cascade: z.boolean().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cascade = input.cascade || false;
      const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString: PG_CONNECTION });
      const { data, error } = await pgMeta.tables.remove(input.tableId, { cascade });
      await pgMeta.end();
      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      return data;
    }),
  columns: t.procedure
    .input(
      z.object({
        tableId: z.number()
      })
    )
    .query(async ({ ctx, input }) => {
      const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString: PG_CONNECTION });
      const { data, error } = await pgMeta.columns.list({
        includeSystemSchemas: false,
        tableId: Number(input.tableId)
      });
      await pgMeta.end();
      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      return data;
    }),
  createColumn: t.procedure
    .input(
      z.object({
        tableId: z.number(),
        name: z.string(),
        type: z.string(),
        defaultValue: z.any().optional(),
        defaultValueFormat: z.string().optional(),
        isIdentity: z.boolean().optional(),
        isNullable: z.boolean().optional(),
        isUnique: z.boolean().optional(),
        isPrimaryKey: z.boolean().optional(),
        comment: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString: PG_CONNECTION });
      const { data, error } = await pgMeta.columns.create({
        table_id: input.tableId,
        name: input.name,
        type: input.type,
        default_value: input.defaultValue,
        // @ts-ignore
        default_value_format: input.defaultValueFormat,
        is_identity: input.isIdentity,
        is_nullable: input.isNullable,
        is_unique: input.isUnique,
        is_primary_key: input.isPrimaryKey,
        comment: input.comment
      });
      await pgMeta.end();
      return { data, errorMsg: error?.message };
    }),
  updateColumn: t.procedure
    .input(
      z.object({
        columnId: z.string(),
        name: z.string().optional(),
        type: z.string().optional(),
        defaultValue: z.any().optional(),
        defaultValueFormat: z.string().optional(),
        isIdentity: z.boolean().optional(),
        isNullable: z.boolean().optional(),
        isUnique: z.boolean().optional(),
        comment: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString: PG_CONNECTION });
      const { data, error } = await pgMeta.columns.update(input.columnId, {
        name: input.name,
        type: input.type,
        default_value: input.defaultValue,
        // @ts-ignore
        default_value_format: input.defaultValueFormat,
        is_identity: input.isIdentity,
        is_nullable: input.isNullable,
        is_unique: input.isUnique,
        comment: input.comment
      });
      await pgMeta.end();
      return { data, errorMsg: error?.message };
    }),
  deleteColumn: t.procedure
    .input(
      z.object({
        columnId: z.string(),
        cascade: z.boolean().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cascade = input.cascade || false;
      const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString: PG_CONNECTION });
      const { data, error } = await pgMeta.columns.remove(input.columnId, { cascade });
      await pgMeta.end();
      return { data, errorMsg: error?.message };
    }),
  query: t.procedure
    .input(
      z.object({
        sql: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString: PG_CONNECTION });
      const { data, error } = await pgMeta.query(input.sql);
      await pgMeta.end();
      return { data, errorMsg: error?.message };
    })
});

export type PgRouter = typeof pgRouter;
export type TableType = inferProcedureOutput<PgRouter['tables']>[0];
export type ColumnType = inferProcedureOutput<PgRouter['columns']>[0];