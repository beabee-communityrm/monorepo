import { Expose } from "class-transformer";
import { IsUUID } from "class-validator";

export class GetUploadFlowDto {
  @IsUUID()
  @Expose()
  id!: string;
}

export class FileUploadResultDto {
  @Expose()
  url!: string;

  @Expose()
  urls?: { [key: string]: string };
}
