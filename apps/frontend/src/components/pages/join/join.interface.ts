export interface SetupContactData {
  email: string;
  firstName: string;
  lastName: string;
  profile: {
    newsletterOptIn: boolean;
    deliveryOptIn: boolean;
  };
  addressLine1: string;
  addressLine2: string;
  cityOrTown: string;
  postCode: string;
}
