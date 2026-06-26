// src/app/__tests__/csp.test.ts

describe('Content Security Policy', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.resetModules();
  });

  async function loadNextConfig() {
    jest.resetModules();
    const nextConfigModule = await import('../../../next.config');
    return nextConfigModule.default as { headers: () => Promise<unknown[]> };
  }

  test('development includes unsafe-eval and unsafe-inline', async () => {
    process.env.NODE_ENV = 'development';
    const nextConfig = await loadNextConfig();
    const result = await nextConfig.headers();
    const cspHeader = (result as Array<{ headers: Array<{ key: string; value: string }> }>)[0].headers.find(
      (h) => h.key === 'Content-Security-Policy'
    );
    expect(cspHeader).toBeDefined();
    const value: string = cspHeader!.value;
    expect(value).toContain("script-src 'self' 'unsafe-eval'");
    expect(value).toContain("style-src 'self' 'unsafe-inline'");
  });

  test('production omits unsafe-eval and unsafe-inline', async () => {
    process.env.NODE_ENV = 'production';
    const nextConfig = await loadNextConfig();
    const result = await nextConfig.headers();
    const cspHeader = (result as Array<{ headers: Array<{ key: string; value: string }> }>)[0].headers.find(
      (h) => h.key === 'Content-Security-Policy'
    );
    expect(cspHeader).toBeDefined();
    const value: string = cspHeader!.value;
    expect(value).toContain("script-src 'self'");
    expect(value).not.toContain("unsafe-eval");
    expect(value).toContain("style-src 'self'");
    expect(value).not.toContain("unsafe-inline");
  });
});
