import type { AppQrCodeTypeNumber } from '@type/app-qr-code-type-number';
import type { AppQrCodeErrorCorrectionLevel } from '@type/app-qr-code-error-correction-level';

export interface AppQrCodeProps {
  qrData: string;
  typeNumber?: AppQrCodeTypeNumber;
  correctionLevel?: AppQrCodeErrorCorrectionLevel;
}
