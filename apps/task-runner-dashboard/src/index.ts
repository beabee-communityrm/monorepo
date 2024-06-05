import { createDashboard } from './dashboard';
import * as queues from './queues';

const { addQueue, removeQueue, setQueues, replaceQueues } = createDashboard(Object.values(queues));

