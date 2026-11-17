import { AnalysisResultService } from '../analysisResult/analysisResult.service';

describe('interval result routing', () => {
  const previous = process.env.INTERVAL_MODEL_ENABLED;
  afterEach(() => {
    if (previous === undefined) delete process.env.INTERVAL_MODEL_ENABLED;
    else process.env.INTERVAL_MODEL_ENABLED = previous;
  });
  it('uses the interval reader when explicitly enabled', async () => {
    process.env.INTERVAL_MODEL_ENABLED = 'true';
    const reader = {
      read: jest.fn().mockResolvedValue({ result: null, descriptions: [] }),
    };
    const args = [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      reader,
    ] as unknown as ConstructorParameters<typeof AnalysisResultService>;
    const service = new AnalysisResultService(...args);
    await expect(
      service.getResultByResultId({ resultId: 'synthetic' }),
    ).resolves.toEqual({ result: null, descriptions: [] });
    expect(reader.read).toHaveBeenCalledWith('synthetic');
  });
  it('fails closed when enabled without the interval reader', async () => {
    process.env.INTERVAL_MODEL_ENABLED = 'true';
    const args = [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
    ] as unknown as ConstructorParameters<typeof AnalysisResultService>;
    const service = new AnalysisResultService(...args);
    await expect(
      service.getResultByResultId({ resultId: 'synthetic' }),
    ).rejects.toThrow('result_read_failed');
  });
});
