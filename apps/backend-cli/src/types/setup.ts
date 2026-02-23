export interface SetupSupportEmailArgs {
  emailDomain: string | undefined;
}

export interface SetupPaymentMethodsArgs {
  paymentMethods: string[] | undefined;
}

export interface SetupAdminArgs {
  firstname: string | undefined;
  lastname: string | undefined;
  email: string | undefined;
  password: string | undefined;
}

export interface SetupAllArgs
  extends SetupSupportEmailArgs,
    SetupPaymentMethodsArgs,
    SetupAdminArgs {}
