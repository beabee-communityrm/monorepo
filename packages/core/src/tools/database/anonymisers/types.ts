/**
 * Types and interfaces for database dump operations
 */

/**
 * Represents a database dump structure
 * Maps table names to arrays of records
 */
export interface DatabaseDump {
  [tableName: string]: any[];
}
