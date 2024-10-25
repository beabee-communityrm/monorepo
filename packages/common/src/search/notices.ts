import type { AssertFilters, Filters } from "../types/index.ts";
import { ItemStatus } from "../data/index.ts";

type NoticeFilters = {
  readonly id: {
    readonly type: "text";
  };
  readonly createdAt: {
    readonly type: "date";
  };
  readonly updatedAt: {
    readonly type: "date";
  };
  readonly name: {
    readonly type: "text";
  };
  readonly expires: {
    readonly type: "date";
    readonly nullable: true;
  };
  readonly enabled: {
    readonly type: "boolean";
  };
  readonly text: {
    readonly type: "text";
  };
  readonly status: {
    readonly type: "enum";
    readonly options: [
      ItemStatus.Draft,
      ItemStatus.Scheduled,
      ItemStatus.Open,
      ItemStatus.Ended,
    ];
  };
};

export const noticeFilters: AssertFilters<NoticeFilters> = {
  id: {
    type: "text",
  },
  createdAt: {
    type: "date",
  },
  updatedAt: {
    type: "date",
  },
  name: {
    type: "text",
  },
  expires: {
    type: "date",
    nullable: true,
  },
  enabled: {
    type: "boolean",
  },
  text: {
    type: "text",
  },
  status: {
    type: "enum",
    options: [
      ItemStatus.Draft,
      ItemStatus.Scheduled,
      ItemStatus.Open,
      ItemStatus.Ended,
    ] as const satisfies ItemStatus[],
  },
} as const satisfies Filters;
