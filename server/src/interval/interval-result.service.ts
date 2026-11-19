import { Injectable } from '@nestjs/common';
import { sourceAppliesToAges } from '../analysisResult/source-age-scope';
import { IntervalMeasurement } from './interval-matcher';
import { IntervalReaderService } from './interval-reader.service';
import {
  projectIntervalResult,
  ProjectionSource,
} from './interval-result-projection';

@Injectable()
export class IntervalResultService {
  constructor(private readonly reader: IntervalReaderService) {}

  async evaluate(input: {
    ageIds: readonly number[];
    measurements: IntervalMeasurement[];
    descriptions: { id: number; description_ru: string; alternativeToId?: number | null }[];
    sources: ProjectionSource[];
  }) {
    const sources = input.sources.filter((source) =>
      sourceAppliesToAges(source.ageIds, input.ageIds),
    );
    const matching = await this.reader.evaluate(input.measurements, sources);
    const detailsById = new Map(
      input.descriptions.map((description) => [description.id, description]),
    );
    const descriptions = matching.descriptions.flatMap((description) => {
      const details = detailsById.get(description.id);
      return details === undefined ? [] : [{ ...description, ...details }];
    });
    return {
      ...projectIntervalResult(
        input.ageIds,
        input.measurements.map((measurement) => measurement.pointId),
        matching.intervals,
        descriptions,
        sources,
      ),
      warnings: matching.warnings,
      references: matching.references,
      displayReferences: matching.displayReferences,
    };
  }
}
