import snowflake, { Connection } from 'snowflake-sdk';
import { getPoolConfig } from '@/server/utils/db.utils';

// Create a singleton instance of the connection pool
let connectionPool: snowflake.Pool<Connection> | null = null;

export function getConnectionPool() {
  const config = getPoolConfig();

  if (!connectionPool) {
    connectionPool = snowflake.createPool(config.connOptions, config.poolOptions);

    console.log('Snowflake connection pool created');
  }
  return connectionPool;
}

export async function executeQuery<T = Record<string, any>>(
  sqlText: string,
  binds: any[] = [],
): Promise<{
    stmt: snowflake.RowStatement;
    rows: T[];
  }> {
  const pool = getConnectionPool();
  console.log(`Executing query: ${sqlText}`, binds ? `with binds: ${JSON.stringify(binds)}` : '');

  return new Promise<{
    stmt: snowflake.RowStatement;
    rows: T[];
  }>((resolve, reject) => {
    pool
      .use(async (clientConnection) => {
        try {
          clientConnection.execute({
            sqlText,
            binds,
            complete: (err, stmt, rows) => {
              if (err) {
                console.error(`Query failed: ${sqlText}`, err);
                reject(err);
              } else {
                console.log(`Query completed: ${sqlText} (${rows?.length || 0} rows)`);
                resolve({
                  stmt,
                  rows: (rows || []) as T[],
                });
              }
            },
          });
        } catch (error) {
          console.error(`Error executing query: ${sqlText}`, error);
          reject(error);
        }
      })
      .catch((error) => {
        console.error(`Pool use error for query: ${sqlText}`, error);
        reject(error);
      });
  });
}

export async function closeConnectionPool(): Promise<void> {
  if (connectionPool) {
    await connectionPool.drain();
    await connectionPool.clear();
    connectionPool = null;
    console.log('Snowflake connection pool closed');
  }
}
