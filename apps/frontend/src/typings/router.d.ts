import { RoleType } from '@beabee/beabee-common';
import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    pageTitle: string;
    layout?: 'Auth' | 'Dashboard' | 'Loading';
    noAuth?: boolean;
    role?: RoleType;
    embeddable?: boolean;
    noCnrMode?: boolean;
  }
}
