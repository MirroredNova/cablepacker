import crypto from 'crypto';
import { serverConfig } from '@/config';

export const createPrivateKey = (keyString: string) => {
  const cleanKey = keyString.replace(/\\n/g, '\n').replace(/^['"]|['"]$/g, '');

  try {
    const privateKeyObject = crypto.createPrivateKey({
      key: cleanKey,
      format: 'pem',
    });

    return privateKeyObject
      .export({
        format: 'pem',
        type: 'pkcs8',
      })
      .toString();
  } catch (error) {
    console.error('Error processing private key:', error);
    throw error;
  }
};

export const getPoolConfig = () => {
  const privateKey = createPrivateKey(serverConfig.SFDB_P8KEY);

  const connOptions = {
    account: serverConfig.SFDB_ACCOUNT,
    username: serverConfig.SFDB_USERNAME,
    role: serverConfig.SFDB_ROLE,
    warehouse: serverConfig.SFDB_WAREHOUSE,
    authenticator: serverConfig.SFDB_AUTHENTICATOR,
    database: serverConfig.SFDB_DATABASE,
    schema: serverConfig.SFDB_SCHEMA,
    privateKey,
  };

  const poolOptions = {
    min: serverConfig.SFDB_MIN_POOL_SIZE,
    max: serverConfig.SFDB_MAX_POOL_SIZE,
    acquireTimeoutMillis: serverConfig.SFDB_ACQUIRETIMEOUTMILLIS,
    evictionRunIntervalMillis: serverConfig.SFDB_EVICTIONRUNINTERVALMILLIS,
    testOnBorrow: true,
  };

  return {
    connOptions,
    poolOptions,
  };
};
