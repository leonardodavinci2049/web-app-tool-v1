import {
  createPool,
  type Pool,
  type PoolConnection,
  type PoolOptions,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";
import { envs } from "@/core/config/envs";

// Classe de erro customizada para conexão com banco de dados
export class ErroConexaoBancoDados extends Error {
  constructor(
    mensagem: string,
    public readonly erroOriginal: Error,
  ) {
    super(mensagem);
    this.name = "ErroConexaoBancoDados";
  }
}

// Classe de erro customizada para execução de consultas
export class ErroExecucaoConsulta extends Error {
  constructor(
    mensagem: string,
    public readonly consulta: string,
    public readonly erroOriginal: Error,
  ) {
    super(mensagem);
    this.name = "ErroExecucaoConsulta";
  }
}

class DatabaseService {
  private poolConnection: Pool | null = null;
  private static instance: DatabaseService;

  private constructor() {}

  // Singleton pattern - garante uma única instância
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Conecta ao banco de dados MySQL
  public connect(): void {
    if (this.poolConnection) {
      console.log("Conexão com banco de dados já estabelecida");
      return;
    }

    try {
      const config: PoolOptions = {
        host: envs.DATABASE_HOST,
        port: envs.DATABASE_PORT,
        database: envs.DATABASE_NAME,
        user: envs.DATABASE_USER,
        password: envs.DATABASE_PASSWORD,
        waitForConnections: true,
        connectionLimit: 5,
        maxIdle: 2,
        idleTimeout: 10000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 5000,
        queueLimit: 50,
      };

      this.poolConnection = createPool(config);
      // console.log("Conectado ao banco de dados MySQL");
    } catch (error) {
      console.error(
        "Erro ao conectar ao banco de dados MySQL com mysql2",
        error,
      );
      throw new ErroConexaoBancoDados(
        "Falha ao estabelecer conexão com o banco de dados",
        error as Error,
      );
    }
  }

  // Garante que a conexão está estabelecida
  private ensureConnection(): Pool {
    if (!this.poolConnection) {
      this.connect();
    }
    if (!this.poolConnection) {
      throw new ErroConexaoBancoDados(
        "Não foi possível estabelecer conexão com o banco de dados",
        new Error("Pool connection is null"),
      );
    }
    return this.poolConnection;
  }

  // Método para SELECT (sem transação)
  async selectQuery<T extends RowDataPacket>(
    queryString: string,
    params?: unknown[],
  ): Promise<T[]> {
    try {
      const pool = this.ensureConnection();
      const [results] = await pool.query<T[]>(queryString, params);
      return results;
    } catch (error) {
      console.error("Erro ao executar selectQuery:", error);
      throw new ErroExecucaoConsulta(
        "Falha ao executar consulta SELECT",
        queryString,
        error as Error,
      );
    }
  }

  // Método para SELECT com segurança reforçada
  async selectExecute<T extends RowDataPacket>(
    queryString: string,
    params?: unknown[],
  ): Promise<T[]> {
    try {
      const pool = this.ensureConnection();
      const [results] = await pool.execute<T[]>(queryString, params);
      return results;
    } catch (error) {
      console.error("Erro ao executar selectExecute:", error);
      throw new ErroExecucaoConsulta(
        "Falha ao executar consulta SELECT com execute",
        queryString,
        error as Error,
      );
    }
  }

  // Insert/Update/Delete usando execute
  async ModifyExecute(
    queryString: string,
    params?: unknown[],
  ): Promise<ResultSetHeader> {
    try {
      const pool = this.ensureConnection();
      const [results] = await pool.execute(queryString, params);
      return results as ResultSetHeader;
    } catch (error) {
      console.error("Erro ao executar ModifyExecute:", error);
      throw new ErroExecucaoConsulta(
        "Falha ao executar operação de modificação com execute",
        queryString,
        error as Error,
      );
    }
  }

  // Insert/Update/Delete usando query
  async ModifyQuery(
    queryString: string,
    params?: unknown[],
  ): Promise<ResultSetHeader> {
    try {
      const pool = this.ensureConnection();
      const [results] = await pool.query(queryString, params);
      return results as ResultSetHeader;
    } catch (error) {
      console.error("Erro ao executar ModifyQuery:", error);
      throw new ErroExecucaoConsulta(
        "Falha ao executar operação de modificação com query",
        queryString,
        error as Error,
      );
    }
  }

  // Operações com transação
  async runInTransaction<T>(
    callback: (connection: PoolConnection) => Promise<T>,
  ): Promise<T> {
    const connection = await this.getConnection();

    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      console.error("Transação falhou Revertida. Revertida.", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtém uma conexão do pool
  async getConnection(): Promise<PoolConnection> {
    try {
      const pool = this.ensureConnection();
      return await pool.getConnection();
    } catch (error) {
      console.error(
        `Falha ao obter conexão do banco de dados: ${error}`,
        error,
      );
      throw new ErroConexaoBancoDados(
        "Falha ao obter conexão do pool",
        error as Error,
      );
    }
  }

  // Fechamento do pool
  async closeConnection(): Promise<void> {
    if (this.poolConnection) {
      await this.poolConnection.end();
      this.poolConnection = null;
      console.log("Pool de conexões MySQL fechado");
    }
  }
}

// Instância singleton do serviço de banco de dados
const dbService = DatabaseService.getInstance();

// Conecta automaticamente apenas em produção/runtime, não durante build
if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
  // Conecta apenas se não estivermos em build time
  if (!process.env.BUILDING) {
    try {
      dbService.connect();
    } catch (error) {
      console.warn(
        "Aviso: Não foi possível conectar ao banco durante inicialização:",
        error,
      );
    }
  }
}

export default dbService;
export { DatabaseService };
