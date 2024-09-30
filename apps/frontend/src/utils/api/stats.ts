import type {
  GetStatsQuery,
  GetStatsData,
  Serial,
} from '@beabee/beabee-common';
import { instance } from '.';

export async function fetchStats(query: GetStatsQuery): Promise<GetStatsData> {
  return (await instance.get<Serial<GetStatsData>>('/stats', { params: query }))
    .data;
}
