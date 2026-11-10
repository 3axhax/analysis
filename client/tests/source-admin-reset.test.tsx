import { describe, expect, it } from 'vitest';
import { analysisPointSlice } from '../src/entities/analysisPoint/model/slice';
import { getFullAnalysisPointList } from '../src/entities/analysisPoint/model/extraReducers';
import { descriptionsSlice } from '../src/entities/descriptions/model/slice';
import { getDescriptionsListWithTranslate } from '../src/entities/descriptions/model/extraReducers';

describe('source context reset', () => {
  it('ignores a pending parameter list after switching source', () => {
    const reducer = analysisPointSlice.reducer;
    let state = reducer(undefined, getFullAnalysisPointList.pending('old', undefined));
    state = reducer(state, analysisPointSlice.actions.resetAdminView());
    state = reducer(state, getFullAnalysisPointList.fulfilled({ rows: [{ id: 1 }], totalRecord: 1, currentPage: 1 }, 'old', undefined));
    expect(state.list).toEqual([]);
    expect(state.editAnalysisPointId).toBe(0);
  });
  it('ignores a pending description list after switching source', () => {
    const reducer = descriptionsSlice.reducer;
    let state = reducer(undefined, getDescriptionsListWithTranslate.pending('old', undefined));
    state = reducer(state, descriptionsSlice.actions.resetAdminView());
    state = reducer(state, getDescriptionsListWithTranslate.fulfilled({ rows: [{ id: 1 }], totalRecord: 1, currentPage: 1 }, 'old', undefined));
    expect(state.list).toEqual([]);
    expect(state.editDescriptionId).toBe(0);
  });
});
