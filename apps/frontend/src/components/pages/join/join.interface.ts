export interface SetupContactData {
  email: string;
  firstName: string;
  lastName: string;
  organisationName: string;
  password: string;
  profile: {
    deliveryOptIn: boolean;
  };
  newsletter: {
    optIn: boolean;
    groups: string[];
  };
  addressLine1: string;
  addressLine2: string;
  cityOrTown: string;
  postCode: string;
  country: string;
}
