import { RolesGuard } from './roles.guard';
import { ExecutionContext } from '@nestjs/common';
describe('unit administration role restrictions', () => {
  const setup = (role: string | null, header?: string) => {
    const request = { headers: { authorization: header } };
    const context = {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    const guard = new RolesGuard(
      { getAllAndOverride: () => ['ADMIN'] } as never,
      {
        getUserById: () =>
          Promise.resolve(
            role ? { get: () => ({ roles: [{ value: role }] }) } : null,
          ),
      } as never,
      {
        checkUser: () => Promise.resolve(role ? { userId: 1 } : null),
      } as never,
    );
    return { guard, context };
  };
  it('denies anonymous access', async () => {
    const s = setup(null);
    await expect(s.guard.canActivate(s.context)).rejects.toThrow(
      'Request Forbidden',
    );
  });
  it('denies USER and allows ADMIN without expanding public routes', async () => {
    const user = setup('USER', 'Bearer synthetic-test-token');
    expect(await user.guard.canActivate(user.context)).toBe(false);
    const admin = setup('ADMIN', 'Bearer synthetic-test-token');
    expect(await admin.guard.canActivate(admin.context)).toBe(true);
  });
  it('denies unknown tokens', async () => {
    const s = setup(null, 'Bearer synthetic-unknown-token');
    await expect(s.guard.canActivate(s.context)).rejects.toThrow(
      'Request Forbidden',
    );
  });
});
