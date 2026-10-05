export function validateAuthBody(body = {}) { return { email: body.email, password: body.password }; }
