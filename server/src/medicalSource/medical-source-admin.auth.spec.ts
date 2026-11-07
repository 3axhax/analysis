import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { MedicalSourceAdminController } from './medical-source-admin.controller';
import { RolesGuard } from '../auth/roles.guard';

const contextFor = (authorization?: string) =>
  ({
    getHandler: () => MedicalSourceAdminController.prototype.listSources,
    getClass: () => MedicalSourceAdminController,
    switchToHttp: () => ({
      getRequest: () => ({ headers: { authorization } }),
    }),
  }) as unknown as ExecutionContext;

describe('medical source administration authorization', () => {
  const users = { getUserById: jest.fn() };
  const sessions = { checkUser: jest.fn() };
  const guard = new RolesGuard(
    new Reflector(),
    users as never,
    sessions as never,
  );
  beforeEach(() => jest.resetAllMocks());

  it('rejects anonymous and invalid sessions', async () => {
    await expect(guard.canActivate(contextFor())).rejects.toThrow();
    sessions.checkUser.mockResolvedValue(null);
    await expect(
      guard.canActivate(contextFor('Bearer invalid')),
    ).rejects.toThrow();
  });

  it('allows only ADMIN', async () => {
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
