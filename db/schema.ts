/** Database schema is maintained as versioned PostgreSQL SQL migrations in db/migrations. */
export type DatabaseRole = 'superadmin' | 'admin' | 'manager' | 'collaborator';
