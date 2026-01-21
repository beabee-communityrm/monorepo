import { log as mainLogger } from '#logging';
import { Contact } from '#models';
import ApiKeyService from '#services/ApiKeyService';
import CalloutsService from '#services/CalloutsService';
import ContactMfaService from '#services/ContactMfaService';
import ContactsService from '#services/ContactsService';
import NewsletterService from '#services/NewsletterService';
import PaymentService from '#services/PaymentService';
import ReferralsService from '#services/ReferralsService';
import ResetSecurityFlowService from '#services/ResetSecurityFlowService';
import SegmentService from '#services/SegmentService';

const log = mainLogger.child({ app: 'dispatch-service' });

/**
 * Dispatch service for operations that talk to a lot of services. This avoids
 * lots of circular dependencies between services
 */
class DispatchService {
  async permanentlyDeleteContact(contact: Contact): Promise<void> {
    log.info('Permanently deleting contact ' + contact.id);

    // Delete external data first, this is more likely to fail so we'd exit the process early
    await NewsletterService.permanentlyDeleteContact(contact);
    await PaymentService.permanentlyDeleteContact(contact);

    // Delete internal data after the external services are done, this should really never fail
    await ResetSecurityFlowService.deleteAll(contact);
    await ApiKeyService.permanentlyDeleteContact(contact);
    await ReferralsService.permanentlyDeleteContact(contact);
    await SegmentService.permanentlyDeleteContact(contact);
    await CalloutsService.permanentlyDeleteContact(contact);
    await ContactMfaService.permanentlyDeleteContact(contact);

    // Finally delete the contact itself
    await ContactsService.permanentlyDeleteContact(contact);
  }
}

export const dispatchService = new DispatchService();
export default dispatchService;
