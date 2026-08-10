export interface SetupContactData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  profile: {
    newsletterOptIn: boolean;
    newsletterGroups: string[];
    deliveryOptIn: boolean;
  };
  addressLine1: string;
  addressLine2: string;
  cityOrTown: string;
  postCode: string;
}
