import { createDashboard } from './dashboard';
import * as queues from './queues';

const { addQueue, removeQueue, setQueues, replaceQueues, express } = createDashboard(Object.values(queues));

