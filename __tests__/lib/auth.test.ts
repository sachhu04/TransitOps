import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateToken, verifyToken, requireAuth, requireRoles } from '@/lib/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

describe('Auth Utilities', () => {
  const mockPayload = { id: 'user-1', email: 'test@example.com', role: 'ADMIN' };
  let token: string;

  beforeEach(() => {
    token = generateToken(mockPayload);
  });

  describe('generateToken & verifyToken', () => {
    it('should generate a valid JWT token', () => {
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should correctly verify and decode a valid token', () => {
      const decoded = verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.id).toBe(mockPayload.id);
      expect(decoded?.email).toBe(mockPayload.email);
      expect(decoded?.role).toBe(mockPayload.role);
    });

    it('should return null for an invalid token', () => {
      const decoded = verifyToken('invalid.token.string');
      expect(decoded).toBeNull();
    });

    it('should return null for an expired token', () => {
      // Generate a token that expired instantly
      const expiredToken = generateToken(mockPayload, '-10s');
      const decoded = verifyToken(expiredToken);
      expect(decoded).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('should return 401 if no token is provided', async () => {
      const req = { cookies: {}, headers: {} } as unknown as NextApiRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as NextApiResponse;
      const handler = vi.fn();

      const wrappedHandler = requireAuth(handler);
      await wrappedHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: No token provided' });
      expect(handler).not.toHaveBeenCalled();
    });

    it('should extract token from Bearer header and call handler if valid', async () => {
      const req = {
        cookies: {},
        headers: { authorization: `Bearer ${token}` },
      } as unknown as NextApiRequest;
      const res = {} as NextApiResponse;
      const handler = vi.fn();

      const wrappedHandler = requireAuth(handler);
      await wrappedHandler(req, res);

      expect(handler).toHaveBeenCalled();
      const calledArgs = handler.mock.calls[0];
      expect(calledArgs[0]).toBe(req);
      expect(calledArgs[1]).toBe(res);
      expect(calledArgs[2].id).toBe(mockPayload.id);
    });

    it('should return 401 if token is invalid', async () => {
      const req = { cookies: { token: 'bad-token' }, headers: {} } as unknown as NextApiRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as NextApiResponse;
      const handler = vi.fn();

      const wrappedHandler = requireAuth(handler);
      await wrappedHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid token' });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('requireRoles', () => {
    it('should allow access if user has required role', async () => {
      const req = { cookies: { token }, headers: {} } as unknown as NextApiRequest;
      const res = {} as NextApiResponse;
      const handler = vi.fn();

      const wrappedHandler = requireRoles(['ADMIN', 'MANAGER'], handler);
      await wrappedHandler(req, res);

      expect(handler).toHaveBeenCalled();
    });

    it('should return 403 if user lacks required role', async () => {
      // User is ADMIN, but route requires MANAGER
      const req = { cookies: { token }, headers: {} } as unknown as NextApiRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as NextApiResponse;
      const handler = vi.fn();

      const wrappedHandler = requireRoles(['MANAGER'], handler);
      await wrappedHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Insufficient permissions' });
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
