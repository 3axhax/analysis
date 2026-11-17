import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../auth/roles.guard';
import { IntervalAdminController } from './interval-admin.controller';

const contextFor = (authorization?: string) =>
  ({
    // Nest's Reflector reads metadata from the unbound method.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    getHandler: () => IntervalAdminController.prototype.save,
    getClass: () => IntervalAdminController,
    switchToHttp: () => ({
      getRequest: () => ({ headers: { authorization } }),
    }),
  }) as unknown as ExecutionContext;

describe('interval administration authorization', () => {
  const users = { getUserById: jest.fn() };
  const sessions = { checkUser: jest.fn() };
  const guard = new RolesGuard(
    new Reflector(),
    users as never,
    sessions as never,
  );
  beforeEach(() => jest.resetAllMocks());
  it('rejects anonymous, invalid and revoked sessions', async () => {
    await expect(guard.canActivate(contextFor())).rejects.toThrow();
    sessions.checkUser.mockResolvedValue(null);
    await expect(
      guard.canActivate(contextFor('Bearer invalid')),
    ).rejects.toThrow();
    await expect(
      guard.canActivate(contextFor('Bearer revoked')),
    ).rejects.toThrow();
  });
  it('allows ADMIN and rejects USER', async () => {
    sessions.checkUser.mockResolvedValue({ userId: 1 });
    users.getUserById.mockResolvedValue({
      get: () => ({ roles: [{ value: 'USER' }] }),
    });
    await expect(
      guard.canActivate(contextFor('Bearer synthetic')),
    ).resolves.toBe(false);
    users.getUserById.mockResolvedValue({
      get: () => ({ roles: [{ value: 'ADMIN' }] }),
    });
    await expect(
      guard.canActivate(contextFor('Bearer synthetic')),
    ).resolves.toBe(true);
  });
});
