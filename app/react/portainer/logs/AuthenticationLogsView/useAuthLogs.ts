import { useQuery } from '@tanstack/react-query';

import axios, { parseAxiosError } from '@/portainer/services/axios';

import { AuthLogsResponse } from './types';

export interface AuthQuery {
  offset: number;
  limit: number;
  sortBy?: string;
  sortDesc?: boolean;
  keyword: string;
  after?: number;
  before?: number;
  contexts?: number[];
  types?: number[];
}

export function useAuthLogs(query: AuthQuery) {
  return useQuery({
    queryKey: ['authLogs', query] as const,
    queryFn: () => fetchAuthLogs(query),
    keepPreviousData: true,
  });
}

async function fetchAuthLogs(query: AuthQuery): Promise<AuthLogsResponse> {
  try {
    const { data } = await axios.get<AuthLogsResponse>(
      '/useractivity/authlogs',
      {
        params: {
          offset: query.offset,
          limit: query.limit,
          keyword: query.keyword,
          after: query.after,
          before: query.before,
          contexts: query.contexts?.join(','),
          types: query.types?.join(','),
          sortBy: query.sortBy,
          sortDesc: query.sortDesc,
        },
      }
    );
    return data;
  } catch (err) {
    throw parseAxiosError(err, 'Failed loading authentication logs');
  }
}
