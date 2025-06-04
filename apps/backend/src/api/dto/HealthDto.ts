import type { HealthCheckData } from "@beabee/beabee-common";
import { IsBoolean, IsDate, IsIn, ValidateNested } from "class-validator";

class HealthCheckServicesDto {
  @IsBoolean()
  database!: boolean;
}

export class GetHealthDto implements HealthCheckData {
  @IsIn(["ok", "error"])
  status!: "ok" | "error";

  @IsDate()
  timestamp!: Date;

  @ValidateNested()
  services!: HealthCheckServicesDto;
}
