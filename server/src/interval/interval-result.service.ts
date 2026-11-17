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
    descriptions: { id: number; description_ru: string }[];
    sources: ProjectionSource[];
  }) {
    const matching = await this.reader.evaluate(
      input.measurements,
      input.sources,
    );
    const text = new Map(
      input.descriptions.map((description) => [
        description.id,
        description.description_ru,
      ]),
    );
    const descriptions = matching.descriptions.flatMap((description) => {
      const description_ru = text.get(description.id);
      return description_ru === undefined
        ? []
        : [{ ...description, description_ru }];
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
