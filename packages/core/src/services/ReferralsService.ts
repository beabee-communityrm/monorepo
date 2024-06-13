import _ from "lodash";

import { database } from "#core/database";
import { log as mainLogger } from "#core/logging";

import { emailService } from "#core/services/EmailService";
import type { LocaleObject } from "@beabee/locales";

import {
  ReferralGiftForm,
  Contact,
  ReferralGift,
  Referral
} from "@beabee/models";

const log = mainLogger.child({ app: "referrals-service" });

export class ReferralsService {
  static async getGifts(): Promise<ReferralGift[]> {
    return await database.getRepository(ReferralGift).find();
  }

  static async isGiftAvailable(
    giftForm: ReferralGiftForm,
    amount: number
  ): Promise<boolean> {
    if (!giftForm.referralGift) return true; // No gift option

    const gift = await database.getRepository(ReferralGift).findOneBy({
      name: giftForm.referralGift
    });
    if (gift && gift.enabled && gift.minAmount <= amount) {
      if (giftForm.referralGiftOptions) {
        const optionStockRef = Object.values(giftForm.referralGiftOptions).join(
          "/"
        );
        const optionStock = gift.stock.get(optionStockRef);
        return optionStock === undefined || optionStock > 0;
      } else {
        return true;
      }
    }

    return false;
  }

  static async updateGiftStock(giftForm: ReferralGiftForm): Promise<void> {
    log.info("Update gift stock", giftForm);

    if (giftForm.referralGift) {
      const gift = await database.getRepository(ReferralGift).findOneBy({
        name: giftForm.referralGift
      });
      if (gift && giftForm.referralGiftOptions) {
        const optionStockRef = Object.values(giftForm.referralGiftOptions).join(
          "/"
        );
        const optionStock = gift.stock.get(optionStockRef);
        if (optionStock !== undefined) {
          // TODO: this update isn't atomic
          gift.stock.set(optionStockRef, optionStock - 1);
          database
            .getRepository(ReferralGift)
            .update(gift.name, { stock: gift.stock });
        }
      }
    }
  }

  static async createReferral(
    referrer: Contact | undefined,
    referee: Contact,
    giftForm: ReferralGiftForm,
    locale: LocaleObject
  ): Promise<void> {
    log.info("Create referral", {
      referrerId: referrer?.id,
      refereeId: referee.id,
      giftForm,
      refereeAmount: referee.contributionMonthlyAmount
    });

    const referral = new Referral();
    referral.referrer = referrer || null;
    referral.referee = referee;
    referral.refereeAmount = referee.contributionMonthlyAmount || 0;
    referral.refereeGift = {
      name: giftForm.referralGift || ""
    } as ReferralGift;
    referral.refereeGiftOptions = giftForm.referralGiftOptions || null;

    await database.getRepository(Referral).save(referral);

    await ReferralsService.updateGiftStock(giftForm);

    if (referrer) {
      await emailService.sendTemplateToContact(
        "successful-referral",
        referrer,
        {
          refereeName: referee.firstname,
          isEligible:
            !!referee.contributionMonthlyAmount &&
            referee.contributionMonthlyAmount >= 3
        },
        locale
      );
    }
  }

  static async getContactReferrals(referrer: Contact): Promise<Referral[]> {
    return await database.getRepository(Referral).find({
      relations: { referrerGift: true, referee: true },
      where: { referrerId: referrer.id }
    });
  }

  static async setReferrerGift(
    referral: Referral,
    giftForm: ReferralGiftForm
  ): Promise<boolean> {
    if (
      !referral.referrerHasSelected &&
      (await ReferralsService.isGiftAvailable(giftForm, referral.refereeAmount))
    ) {
      await database.getRepository(Referral).update(referral.id, {
        referrerGift:
          giftForm.referralGift != null
            ? { name: giftForm.referralGift }
            : null,
        referrerGiftOptions: giftForm.referralGiftOptions || null,
        referrerHasSelected: true
      });

      await ReferralsService.updateGiftStock(giftForm);
      return true;
    }

    return false;
  }

  /**
   * Permanently unlink all a contact's referrals
   * @param contact The contact
   */
  static async permanentlyDeleteContact(contact: Contact): Promise<void> {
    log.info("Permanently delete contact referrals for contact " + contact.id);
    await database
      .getRepository(Referral)
      .update({ referrerId: contact.id }, { referrer: null });
  }
}
