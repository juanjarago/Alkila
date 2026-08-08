export class AdminAuthError extends Error {
  constructor(message = "No autorizado.") {
    super(message);
    this.name = "AdminAuthError";
  }
}

export function assertAdmin(req: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  const requestToken = req.headers.get("x-admin-token");

  if (!adminToken) {
    throw new AdminAuthError("Admin no configurado.");
  }

  if (!requestToken || requestToken !== adminToken) {
    throw new AdminAuthError();
  }
}

export function adminStatus(error: unknown) {
  return error instanceof AdminAuthError ? 401 : 500;
}
