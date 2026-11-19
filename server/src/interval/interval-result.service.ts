import { Injectable } from '@nestjs/common';
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
    ageId: number;
    measurements: IntervalMeasurement[];
    descriptions: { id: number; description_ru: string; alternativeToId?: number | null }[];
    sources: ProjectionSource[];
  }) {
    const matching = await this.reader.evaluate(
      input.measurements,
      input.sources,
    );
    const detailsById = new Map(
      input.descriptions.map((description) => [description.id, description]),
    );
    const descriptions = matching.descriptions.flatMap((description) => {
      const details = detailsById.get(description.id);
      return details === undefined ? [] : [{ ...description, ...details }];
    });
    return {
      ...projectIntervalResult(
        input.ageId,
        input.measurements.map((measurement) => measurement.pointId),
        matching.intervals,
        descriptions,
        input.sources,
      ),
      warnings: matching.warnings,
      references: matching.references,
      displayReferences: matching.displayReferences,
    };
  }
}
