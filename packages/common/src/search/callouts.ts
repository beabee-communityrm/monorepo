import type { Filters } from "../types/index.ts";
import { ItemStatus } from "../data/index.ts";
import type { AssertFilters } from "../types/index.ts";

type CalloutFilters = {
  readonly id: {
    readonly type: "text";
  };
  readonly slug: {
    readonly type: "text";
  };
  readonly title: {
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
  readonly answeredBy: {
    readonly type: "contact";
  };
  readonly starts: {
    readonly type: "date";
    readonly nullable: true;
  };
  readonly expires: {
    readonly type: "date";
    readonly nullable: true;
  };
  readonly hidden: {
    readonly type: "boolean";
  };
  readonly channels: {
    readonly type: "array";
  };
};

export const calloutFilters: AssertFilters<CalloutFilters> = {
  id: {
    type: "text",
  },
  slug: {
    type: "text",
  },
  title: {
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
  answeredBy: {
    type: "contact",
  },
  starts: {
    type: "date",
    nullable: true,
  },
  expires: {
    type: "date",
    nullable: true,
  },
  hidden: {
    type: "boolean",
  },
  channels: {
    type: "array",
  },
} as const satisfies Filters;

type CalloutResponseFilters = {
  readonly id: {
    readonly type: "text";
  };
  readonly contact: {
    readonly type: "contact";
    readonly nullable: true;
  };
  readonly calloutId: {
    readonly type: "text";
  };
  readonly createdAt: {
    readonly type: "date";
  };
  readonly updatedAt: {
    readonly type: "date";
  };
  readonly bucket: {
    readonly type: "text";
    readonly nullable: true;
  };
  readonly tags: {
    readonly type: "array";
  };
  readonly assignee: {
    readonly type: "contact";
    readonly nullable: true;
  };
  readonly answers: {
    readonly type: "blob";
  };
};

export const calloutResponseFilters: AssertFilters<CalloutResponseFilters> = {
  id: {
    type: "text",
  },
  contact: {
    type: "contact",
    nullable: true,
  },
  calloutId: {
    type: "text",
  },
  createdAt: {
    type: "date",
  },
  updatedAt: {
    type: "date",
  },
  bucket: {
    type: "text",
    nullable: true,
  },
  tags: {
    type: "array",
  },
  assignee: {
    type: "contact",
    nullable: true,
  },
  answers: {
    type: "blob",
  },
} as const satisfies Filters;

type CalloutResponseCommentFilters = {
  readonly id: {
    readonly type: "text";
  };
  readonly responseId: {
    readonly type: "text";
  };
  readonly contact: {
    readonly type: "contact";
  };
  readonly createdAt: {
    readonly type: "date";
  };
  readonly updatedAt: {
    readonly type: "date";
  };
  readonly text: {
    readonly type: "text";
  };
};

export const calloutResponseCommentFilters: AssertFilters<
  CalloutResponseCommentFilters
> = {
  id: {
    type: "text",
  },
  responseId: {
    type: "text",
  },
  contact: {
    type: "contact",
  },
  createdAt: {
    type: "date",
  },
  updatedAt: {
    type: "date",
  },
  text: {
    type: "text",
  },
} as const satisfies Filters;

type CalloutTagFilters = {
  readonly id: {
    readonly type: "text";
  };
  readonly name: {
    readonly type: "text";
  };
  readonly description: {
    readonly type: "text";
  };
  readonly calloutId: {
    readonly type: "text";
  };
};

export const calloutTagFilters: AssertFilters<CalloutTagFilters> = {
  id: {
    type: "text",
  },
  name: {
    type: "text",
  },
  description: {
    type: "text",
  },
  calloutId: {
    type: "text",
  },
} as const satisfies Filters;

type CalloutChannelFilters = {
  readonly id: {
    readonly type: "text";
  };
  readonly name: {
    readonly type: "text";
  };
  readonly description: {
    readonly type: "text";
  };
  readonly calloutId: {
    readonly type: "text";
  };
};

export const calloutChannelFilters: AssertFilters<CalloutChannelFilters> = {
  id: {
    type: "text",
  },
  name: {
    type: "text",
  },
  description: {
    type: "text",
  },
  calloutId: {
    type: "text",
  },
} as const satisfies Filters;
