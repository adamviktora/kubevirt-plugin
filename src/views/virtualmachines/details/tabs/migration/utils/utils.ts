import { type TFunction } from 'i18next';

import {
  type PrometheusResponse,
  type PrometheusResult,
  type PrometheusValue,
} from '@openshift-console/dynamic-plugin-sdk';

import {
  MIGRATION_INFO_LABELS,
  MIGRATION_REASON_NONE,
  MIGRATION_TIME_MIGRATION_NAME_LABEL,
} from './constants';
import { type MigrationHistoryRow } from './types';

/** Returns the most recent [timestamp, value] sample of a Prometheus series. */
export const getLatestSample = (result: PrometheusResult): PrometheusValue | undefined => {
  const values = result?.values;
  if (values && values.length > 0) {
    return values[values.length - 1];
  }
  return result?.value;
};

const getLatestTimestamp = (result: PrometheusResult): number =>
  Number(getLatestSample(result)?.[0] ?? 0);

/**
 * Builds a map of migration_name -> metric value (as a number), taking the latest
 * sample of each series. Used for the start/end time metrics whose value is the
 * unix-seconds timestamp.
 */
const buildTimeByMigrationName = (response: PrometheusResponse): Record<string, number> => {
  const result: Record<string, number> = {};
  for (const series of response?.data?.result ?? []) {
    const migrationName = series?.metric?.[MIGRATION_TIME_MIGRATION_NAME_LABEL];
    const value = Number(getLatestSample(series)?.[1]);
    if (migrationName && Number.isFinite(value)) {
      result[migrationName] = value;
    }
  }
  return result;
};

/**
 * Assembles one row per migration from kubevirt_vmi_migration_info, joined with the
 * start/end time metrics by migration_name.
 *
 * Because phase/result/reason are labels, a single migration emits several series over
 * its lifetime (one per phase). We group by migration_name and keep the series with the
 * newest sample as the representative final state.
 */
export const buildMigrationHistoryRows = (
  infoResponse: PrometheusResponse,
  startResponse: PrometheusResponse,
  endResponse: PrometheusResponse,
): MigrationHistoryRow[] => {
  const latestSeriesByMigration: Record<string, PrometheusResult> = {};

  for (const series of infoResponse?.data?.result ?? []) {
    const migrationName = series?.metric?.[MIGRATION_INFO_LABELS.migrationName];
    if (!migrationName) {
      continue;
    }
    const current = latestSeriesByMigration[migrationName];
    if (!current || getLatestTimestamp(series) >= getLatestTimestamp(current)) {
      latestSeriesByMigration[migrationName] = series;
    }
  }

  const startTimes = buildTimeByMigrationName(startResponse);
  const endTimes = buildTimeByMigrationName(endResponse);

  return Object.entries(latestSeriesByMigration).map(([migrationName, series]) => {
    const { metric } = series;
    const startTime = startTimes[migrationName];
    const endTime = endTimes[migrationName];
    const durationSeconds =
      Number.isFinite(startTime) && Number.isFinite(endTime) ? endTime - startTime : undefined;

    return {
      durationSeconds,
      endTime: Number.isFinite(endTime) ? endTime : undefined,
      migrationName,
      phase: metric?.[MIGRATION_INFO_LABELS.phase] ?? '',
      reason: metric?.[MIGRATION_INFO_LABELS.reason] ?? '',
      result: metric?.[MIGRATION_INFO_LABELS.result] ?? '',
      sourceNode: metric?.[MIGRATION_INFO_LABELS.sourceNode] ?? '',
      startTime: Number.isFinite(startTime) ? startTime : undefined,
      targetNode: metric?.[MIGRATION_INFO_LABELS.targetNode] ?? '',
      trigger: metric?.[MIGRATION_INFO_LABELS.trigger] ?? '',
    };
  });
};

/** Human-readable label for the migration trigger/cause. */
export const getTriggerLabel = (trigger: string, t: TFunction): string => {
  switch (trigger) {
    case 'evacuation':
      return t('Node drain (evacuation)');
    case 'user':
      return t('User initiated');
    case 'workload_update':
      return t('Workload update');
    default:
      return trigger || t('Unknown');
  }
};

/** Whether a migration has a real failure reason to show. */
export const hasFailureReason = (reason: string): boolean =>
  Boolean(reason) && reason !== MIGRATION_REASON_NONE;
