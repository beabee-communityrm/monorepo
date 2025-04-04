import { Expose } from "class-transformer";
import { IsObject, IsString, IsUUID } from "class-validator";

export class GetUploadFlowDto {
  @IsUUID()
  @Expose()
  id!: string;
}

export class FileUploadResultDto {
  @IsString()
  @Expose()
  url!: string;

  @IsObject()
  @Expose()
  urls?: { [key: string]: string };
}
