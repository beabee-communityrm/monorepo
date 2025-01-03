import type {
  CreateSegmentData,
  GetSegmentData,
  GetSegmentDataWith,
  GetSegmentWith,
  Serial,
  UpdateSegmentData,
  GetSegmentsQuery,
} from '@beabee/beabee-common';
import { instance } from '.';

/** @deprecated please use the client instead */
export async function fetchSegments<With extends GetSegmentWith = void>(
  query?: GetSegmentsQuery,
  _with?: readonly With[]
): Promise<GetSegmentDataWith<With>[]> {
  const { data } = await instance.get<Serial<GetSegmentDataWith<With>>[]>(
    '/segments',
    {
      params: { with: _with, ...query },
    }
  );
  // TODO: needs Serial type guard
  return data as GetSegmentDataWith<With>[];
}

/** @deprecated please use the client instead */
export async function fetchSegment<With extends GetSegmentWith = void>(
  id: string,
  _with?: readonly With[]
): Promise<GetSegmentDataWith<With>> {
  const { data } = await instance.get<Serial<GetSegmentData>>(
    '/segments/' + id,
    {
      params: { with: _with },
    }
  );
  // TODO: needs Serial type guard
  return data as GetSegmentDataWith<With>;
}

/** @deprecated please use the client instead */
export async function createSegment(
  dataIn: CreateSegmentData
): Promise<GetSegmentDataWith<'contactCount'>> {
  const { data } = await instance.post<
    Serial<GetSegmentDataWith<'contactCount'>>
  >('/segments/', {
    name: dataIn.name,
    order: dataIn.order,
    ruleGroup: dataIn.ruleGroup,
    description: '', // TODO: deprecated from API
  });
  return data;
}

/** @deprecated please use the client instead */
export async function updateSegment(
  id: string,
  dataIn: UpdateSegmentData
): Promise<GetSegmentDataWith<'contactCount'>> {
  const { data } = await instance.patch<
    Serial<GetSegmentDataWith<'contactCount'>>
  >('/segments/' + id, {
    name: dataIn.name,
    order: dataIn.order,
    ruleGroup: dataIn.ruleGroup,
  });
  return data;
}

/** @deprecated please use the client instead */
export async function deleteSegment(id: string): Promise<void> {
  await instance.delete('/segments/' + id);
}
