import { instance } from '.';
import type { GetStatsData, GetStatsQuery, Serial } from '@type';

export async function fetchStats(query: GetStatsQuery): Promise<GetStatsData> {
  return (await instance.get<Serial<GetStatsData>>('/stats', { params: query }))
    .data;
}
