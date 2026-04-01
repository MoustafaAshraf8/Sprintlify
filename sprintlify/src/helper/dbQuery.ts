import { DrizzleQueryError } from "drizzle-orm";
import { DatabaseError as PgDatabaseError } from "pg";
import {
  AppError,
  ConflictError,
  ValidationError,
  DatabaseError,
} from "../error/AppError";

// ─── postgres error codes ─────────────────────────────────────────────────────

const pgErrorMap: Record<string, () => AppError> = {
  "23505": () => new ConflictError("A record with this value already exists"),
  "23503": () => new ValidationError("Referenced record does not exist"),
  "23502": () => new ValidationError("A required field is missing"),
  "23514": () => new ValidationError("Value violates check constraint"),
  "22001": () => new ValidationError("Value is too long for this field"),
  "22P02": () => new ValidationError("Invalid input syntax"),
  "08006": () => new DatabaseError("Database connection failed"),
  "08001": () => new DatabaseError("Unable to connect to database"),
  "40001": () => new DatabaseError("Transaction deadlock detected"),
  "40P01": () => new DatabaseError("Transaction deadlock detected"),
  "53300": () => new DatabaseError("Too many database connections"),
  "57014": () => new DatabaseError("Query was cancelled"),
};

const isPgDatabaseError = (
  error: unknown,
): error is { code: string; message: string } =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  "message" in error &&
  typeof (error as any).code === "string";

export const dbQuery = async <T>(operation: () => Promise<T>): Promise<T> => {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    // already a typed AppError — rethrow as is
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof DrizzleQueryError) {
      if (isPgDatabaseError(error.cause)) {
        const code = error.cause.code ?? "unknown";
        const appError = pgErrorMap[code];

        if (appError) throw appError();

        throw new DatabaseError(`Postgres error: ${error.cause.message}`);
      }
      throw new DatabaseError(`Query error: ${error.message}`);
    }

    if (error instanceof Error) {
      throw new DatabaseError(error.message);
    }

    throw new DatabaseError("An unexpected database error occurred");
  }
};
