DELETE FROM "api_key"

DELETE FROM "export_item";

DELETE FROM "reset_security_flow";

DELETE FROM "referral";

DELETE FROM "referral_gift";

DELETE FROM "project_engagement";

DELETE FROM "project_contact";

DELETE FROM "project";

DELETE FROM "callout_variant";

DELETE FROM "signup_flow";

DELETE FROM "payment_flow";

DELETE FROM "callout_response_segment";

DELETE FROM "callout_reviewer";

DELETE FROM "callout_response_tag";

DELETE FROM "callout_response_comment";

DELETE FROM "callout_response";

DELETE FROM "callout_tag";

DELETE FROM "callout";

DELETE FROM "page_settings";

DELETE FROM "content";

DELETE FROM "option";

DELETE FROM "notice";

DELETE FROM "gift_flow";

DELETE FROM "export";

DELETE FROM "payment";

DELETE FROM "segment_ongoing_email";

DELETE FROM "segment_contact";

DELETE FROM "segment";

DELETE FROM "email_mailing";

DELETE FROM "email";

DELETE FROM "contact_tag_assignments";

DELETE FROM "contact_tag";

DELETE FROM "contact_contribution";

DELETE FROM "contact_profile";

DELETE FROM "contact_role";

DELETE FROM "contact";

INSERT INTO "contact"("id", "email", "firstname", "lastname", "joined", "lastSeen", "loginOverride", "contributionType", "contributionPeriod", "contributionMonthlyAmount", "referralCode", "pollsCode", "passwordHash", "passwordSalt", "passwordIterations", "passwordTries") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16), ($17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32), ($33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48);
["700668c7-2eb1-4e01-adb3-3e2525946cbb","ipejuhhaki@fake.beabee.io","Edna","Nannucci","2026-04-30T11:42:51.415Z","2026-04-30T11:44:43.813Z",null,"None",null,null,"AA002","AA001","","",0,0,"5f5d82ef-4b9a-4eb3-a69c-663116974202","melitetepu@fake.beabee.io","Adelaide","Calosi","2026-04-30T11:45:18.459Z",null,null,"None",null,null,"AA004","AA003","","",0,0,"5b19b8b5-1100-4f0c-809b-b9b9bdda4e12","lohrimkidu@fake.beabee.io","Caleb","Ota","2026-04-30T11:45:49.706Z",null,null,"None",null,null,"AA006","AA005","","",0,0]
INSERT INTO "contact_role"("contactId", "type", "dateAdded", "dateExpires") VALUES ($1, $2, $3, $4);
["700668c7-2eb1-4e01-adb3-3e2525946cbb","superadmin","2026-04-30T11:42:51.415Z",null]
INSERT INTO "contact_profile"("contactId", "description", "bio", "notes", "telephone", "twitter", "preferredContact", "deliveryOptIn", "deliveryAddress", "newsletterStatus", "newsletterGroups") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11), ($12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22), ($23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33);
["700668c7-2eb1-4e01-adb3-3e2525946cbb","","","","","","",0,null,"none","[]","5f5d82ef-4b9a-4eb3-a69c-663116974202","","","","","","",0,null,"none","[]","5b19b8b5-1100-4f0c-809b-b9b9bdda4e12","","","","","","",0,null,"none","[]"]
INSERT INTO "contact_contribution"("contactId", "method", "customerId", "mandateId", "subscriptionId", "payFee", "nextAmount", "cancelledAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8), ($9, $10, $11, $12, $13, $14, $15, $16), ($17, $18, $19, $20, $21, $22, $23, $24);
["700668c7-2eb1-4e01-adb3-3e2525946cbb",null,null,null,null,null,null,null,"5f5d82ef-4b9a-4eb3-a69c-663116974202",null,"CUAD424DE12560",null,null,null,null,null,"5b19b8b5-1100-4f0c-809b-b9b9bdda4e12",null,"CU094A1D8B684C",null,null,null,null,null]
INSERT INTO "segment"("id", "name", "description", "ruleGroup", "order", "newsletterTag") VALUES ($1, $2, $3, $4, $5, $6), ($7, $8, $9, $10, $11, $12), ($13, $14, $15, $16, $17, $18), ($19, $20, $21, $22, $23, $24);
["6a233a3b-74f6-4af8-b4cf-e5070a32746a","Expired last 3 months","","{\"rules\":[{\"field\":\"membershipExpires\",\"value\":[\"$now(M:-3)\",\"$now\"],\"operator\":\"between\"}],\"condition\":\"AND\"}",2,null,"81664449-adf2-4c3a-aee2-145a96d67726","Active members","","{\"rules\":[{\"field\":\"activeMembership\",\"value\":[true],\"operator\":\"equal\"}],\"condition\":\"AND\"}",0,null,"ce1b2919-85c1-4134-8231-df6b860c0ae2","Expires soon","Active members who expire in the next 4 weeks","{\"rules\":[{\"field\":\"membershipExpires\",\"value\":[\"$now(d:28)\"],\"operator\":\"less\"},{\"field\":\"contributionType\",\"value\":[\"Automatic\"],\"operator\":\"not_equal\"}],\"condition\":\"AND\"}",2,null,"f66f45bd-d406-45f6-87da-34d2cd55297a","Joined last 3 months","Contacts who joined in the last 3 months","{\"rules\":[{\"field\":\"joined\",\"value\":[\"$now(M:-3)\"],\"operator\":\"greater\"}],\"condition\":\"AND\"}",1,null]
INSERT INTO "payment"("id", "subscriptionId", "contactId", "status", "type", "description", "amount", "amountRefunded", "chargeDate", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11), ($12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22);
["88c48a5f-d29e-4acf-a3dd-46636962c193",null,"5f5d82ef-4b9a-4eb3-a69c-663116974202","successful","one-time","",28.21,null,"2026-04-30T14:11:10.240Z","2026-04-30T14:11:10.240Z","2026-04-30T14:11:10.240Z","5ac9fb00-4f31-412a-9d2a-1127371fbd6b",null,"5b19b8b5-1100-4f0c-809b-b9b9bdda4e12","successful","one-time","",43.74,null,"2026-04-30T14:11:10.240Z","2026-04-30T14:11:10.240Z","2026-04-30T14:11:10.240Z"]
INSERT INTO "option"("key", "value") VALUES ($1, $2), ($3, $4), ($5, $6), ($7, $8), ($9, $10), ($11, $12), ($13, $14), ($15, $16);
["mailchimp-newsletter-groups","","show-one-time-donation","true","stripe-membership-product-id","","stripe-tax-rate-one-time-id","","stripe-tax-rate-recurring-id","","stripe-webhook-secret","","support-email","support@beabee.io","switch-feature-one-time-donation","true"]
INSERT INTO "callout_response_segment"("id", "name", "ruleGroup", "calloutId", "order") VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10), ($11, $12, $13, $14, $15);
["81664449-adf2-4c3a-aee2-145a96d67726","Inbox","{\"rules\":[{\"field\":\"bucket\",\"value\":[\"\"],\"operator\":\"equal\"}],\"condition\":\"AND\"}",null,0,"ce1b2919-85c1-4134-8231-df6b860c0ae2","Verified","{\"rules\":[{\"field\":\"bucket\",\"value\":[\"verified\"],\"operator\":\"equal\"}],\"condition\":\"AND\"}",null,1,"f66f45bd-d406-45f6-87da-34d2cd55297a","Trash","{\"rules\":[{\"field\":\"bucket\",\"value\":[\"trash\"],\"operator\":\"equal\"}],\"condition\":\"AND\"}",null,2]
INSERT INTO "payment_flow"("id", "date", "paymentFlowId", "params", "form", "processing") VALUES ($1, $2, $3, $4, $5, $6), ($7, $8, $9, $10, $11, $12);
["146a1bdb-37bf-42f9-8686-7be59acdd972","2026-04-30T11:45:36.345Z","87de5bd1-d064-4b9c-9e94-e6f5aeea4594","{\"lastname\":\"Ota\",\"firstname\":\"Caleb\",\"completeUrl\":\"http://localhost:3002/join/complete\",\"paymentMethod\":\"s_card\"}","{\"action\":\"create-one-time-payment\",\"amount\":10,\"payFee\":true}",1,"bed5e7ac-fe4a-44c6-8525-9d7c82e36862","2026-04-30T11:44:58.025Z","707299ff-3ee1-4bb8-bbbd-d4ebb5ed3a10","{\"lastname\":\"Calosi\",\"firstname\":\"Adelaide\",\"completeUrl\":\"http://localhost:3002/join/complete\",\"paymentMethod\":\"s_card\"}","{\"action\":\"create-one-time-payment\",\"amount\":5,\"payFee\":true}",1]
INSERT INTO "signup_flow"("id", "date", "email", "loginUrl", "setPasswordUrl", "confirmUrl", "paymentFlowId", "contactId", "processing", "passwordHash", "passwordSalt", "passwordIterations", "passwordTries") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13), ($14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26);
["93396a59-117e-4e31-a7cb-7c6d605554ac","2026-04-30T11:45:36.688Z","lohrimkidu@fake.beabee.io","https://fake.beabee.io/login","https://fake.beabee.io/set-password","https://fake.beabee.io/confirm","146a1bdb-37bf-42f9-8686-7be59acdd972","5b19b8b5-1100-4f0c-809b-b9b9bdda4e12",1,"","",0,0,"174e4afa-6745-494c-8d21-f439838d8e77","2026-04-30T11:44:58.469Z","melitetepu@fake.beabee.io","https://fake.beabee.io/login","https://fake.beabee.io/set-password","https://fake.beabee.io/confirm","bed5e7ac-fe4a-44c6-8525-9d7c82e36862","5f5d82ef-4b9a-4eb3-a69c-663116974202",1,"","",0,0]
INSERT INTO "reset_security_flow"("id", "contactId", "date", "type") VALUES ($1, $2, $3, $4);
["4904957a-aabb-4b67-b78c-31cbc1e102fd","700668c7-2eb1-4e01-adb3-3e2525946cbb","2026-04-30T11:42:51.435Z","password"]
