import { ActivityActor, ActivityActorType } from '@beabee/beabee-common';

import { AsyncLocalStorage } from 'node:async_hooks';

const storage = new AsyncLocalStorage<ActivityActor>();

const systemActor: ActivityActor = {
  actorType: ActivityActorType.System,
  actorId: null,
};

export const actorContext = {
  // Run with actor as the ambient actor for all async work it starts
  run: <T>(actor: ActivityActor, fn: () => T): T => storage.run(actor, fn),

  // The ambient actor, defaulting to the system actor outside of a scope
  get: (): ActivityActor => storage.getStore() || systemActor,
};
