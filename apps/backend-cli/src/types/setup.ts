export interface SetupSupportEmailArgs {
  emailDomain?: string;
}

export interface SetupPaymentMethodsArgs {
  paymentMethods?: string[];
}

export interface SetupAdminArgs {
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
}

export interface SetupAllArgs
  extends SetupSupportEmailArgs,
    SetupPaymentMethodsArgs,
    SetupAdminArgs {}
