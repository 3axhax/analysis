import { AnalysisResultService } from '../analysisResult/analysisResult.service';

describe('interval result routing', () => {
  it('uses the interval reader unconditionally', async () => {
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
      reader,
    ] as unknown as ConstructorParameters<typeof AnalysisResultService>;
    const service = new AnalysisResultService(...args);
    await expect(
      service.getResultByResultId({ resultId: 'synthetic' }),
    ).resolves.toEqual({ result: null, descriptions: [] });
    expect(reader.read).toHaveBeenCalledWith('synthetic');
  });
  it('fails closed when enabled without the interval reader', async () => {
    const args = [
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
