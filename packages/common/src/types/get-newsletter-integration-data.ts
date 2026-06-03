export interface GetNewsletterIntegrationGroupData {
  id: string;
  name: string;
}

export interface GetNewsletterIntegrationData {
  provider: string;
  status: 'connected' | 'connectionLost' | 'disabled';
  audienceId: string;
  groups: GetNewsletterIntegrationGroupData[];
}
