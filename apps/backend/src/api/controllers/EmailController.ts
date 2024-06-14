import { plainToInstance } from "class-transformer";
import { isUUID } from "class-validator";
import {
  Authorized,
  Body,
  Get,
  JsonController,
  Param,
  Put
} from "routing-controllers";

import { emailService, database, ExternalEmailTemplate } from "@beabee/core";

import { Email } from "@beabee/models";

import { GetEmailDto, UpdateEmailDto } from "#api/dto/EmailDto";

async function findEmail(id: string): Promise<Email | null> {
  if (isUUID(id, "4")) {
    return await database.getRepository(Email).findOneBy({ id });
  } else if (emailService.isTemplateId(id)) {
    const maybeEmail = await emailService.getTemplateEmail(id);
    if (maybeEmail) {
      return maybeEmail;
    } else if (maybeEmail === false) {
      throw new ExternalEmailTemplate();
    }
  }
  return null;
}

// TODO: move to transformer
function emailToData(email: Email): GetEmailDto {
  return plainToInstance(GetEmailDto, {
    subject: email.subject,
    body: email.body
  });
}

@Authorized("admin")
@JsonController("/email")
export class EmailController {
  @Get("/:id")
  async getEmail(@Param("id") id: string): Promise<GetEmailDto | undefined> {
    const email = await findEmail(id);
    return email ? emailToData(email) : undefined;
  }

  @Put("/:id")
  async updateEmail(
    @Param("id") id: string,
    @Body() data: UpdateEmailDto
  ): Promise<GetEmailDto | undefined> {
    const email = await findEmail(id);
    if (email) {
      await database.getRepository(Email).update(email.id, data);
      return data;
    } else if (emailService.isTemplateId(id)) {
      const email = await database.getRepository(Email).save({
        name: "Email for " + id,
        ...data
      });
      await emailService.setTemplateEmail(id, email);
      return emailToData(email);
    }
  }
}
