import { type PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';

import { buildMigrationHistoryRows, getTriggerLabel, hasFailureReason } from './utils';

const t = ((key: string) => key) as any;

const infoSeries = (
  labels: Record<string, string>,
  values: [number, string][],
): PrometheusResponse['data']['result'][number] => ({
  metric: labels,
  values,
});

const response = (result: any[]): PrometheusResponse =>
  ({ data: { result, resultType: 'matrix' } }) as PrometheusResponse;

describe('buildMigrationHistoryRows', () => {
  it('returns no rows for empty responses', () => {
    expect(buildMigrationHistoryRows(response([]), response([]), response([]))).toEqual([]);
  });

  it('produces one row per migration using the latest series for status', () => {
    const info = response([
      infoSeries(
        {
          migration_name: 'mig-1',
          phase: 'Running',
          reason: 'none',
          result: 'in_progress',
          source_node: 'node-a',
          target_node: 'node-b',
          trigger: 'evacuation',
          vmi: 'my-vm',
        },
        [[100, '1']],
      ),
      // Same migration, later phase -> should win as representative.
      infoSeries(
        {
          migration_name: 'mig-1',
          phase: 'Succeeded',
          reason: 'none',
          result: 'succeeded',
          source_node: 'node-a',
          target_node: 'node-b',
          trigger: 'evacuation',
          vmi: 'my-vm',
        },
        [[200, '1']],
      ),
    ]);
    const start = response([infoSeries({ migration_name: 'mig-1' }, [[100, '1000']])]);
    const end = response([infoSeries({ migration_name: 'mig-1' }, [[200, '1075']])]);

    const rows = buildMigrationHistoryRows(info, start, end);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      durationSeconds: 75,
      endTime: 1075,
      migrationName: 'mig-1',
      phase: 'Succeeded',
      reason: 'none',
      result: 'succeeded',
      sourceNode: 'node-a',
      startTime: 1000,
      targetNode: 'node-b',
      trigger: 'evacuation',
    });
  });

  it('leaves duration/end undefined for an ongoing migration', () => {
    const info = response([
      infoSeries(
        {
          migration_name: 'mig-2',
          phase: 'Running',
          reason: 'none',
          result: 'in_progress',
          source_node: 'node-a',
          target_node: 'node-b',
          trigger: 'user',
          vmi: 'my-vm',
        },
        [[100, '1']],
      ),
    ]);
    const start = response([infoSeries({ migration_name: 'mig-2' }, [[100, '1000']])]);

    const rows = buildMigrationHistoryRows(info, start, response([]));

    expect(rows[0].startTime).toBe(1000);
    expect(rows[0].endTime).toBeUndefined();
    expect(rows[0].durationSeconds).toBeUndefined();
  });

  it('captures a failed migration with its reason', () => {
    const info = response([
      infoSeries(
        {
          migration_name: 'mig-3',
          phase: 'Failed',
          reason: 'timeout',
          result: 'failed',
          source_node: 'node-a',
          target_node: 'node-b',
          trigger: 'workload_update',
          vmi: 'my-vm',
        },
        [[300, '1']],
      ),
    ]);

    const rows = buildMigrationHistoryRows(info, response([]), response([]));

    expect(rows[0].phase).toBe('Failed');
    expect(rows[0].reason).toBe('timeout');
  });

  it('ignores series missing a migration_name', () => {
    const info = response([infoSeries({ phase: 'Running' }, [[100, '1']])]);
    expect(buildMigrationHistoryRows(info, response([]), response([]))).toEqual([]);
  });
});

describe('getTriggerLabel', () => {
  it('maps known triggers', () => {
    expect(getTriggerLabel('evacuation', t)).toBe('Node drain (evacuation)');
    expect(getTriggerLabel('user', t)).toBe('User initiated');
    expect(getTriggerLabel('workload_update', t)).toBe('Workload update');
  });

  it('falls back to the raw value', () => {
    expect(getTriggerLabel('something', t)).toBe('something');
  });
});

describe('hasFailureReason', () => {
  it('is false for none/empty', () => {
    expect(hasFailureReason('none')).toBe(false);
    expect(hasFailureReason('')).toBe(false);
  });

  it('is true for a real reason', () => {
    expect(hasFailureReason('timeout')).toBe(true);
  });
});
