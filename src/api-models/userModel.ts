export default interface UserModel {
  primaryEmail: string,
  name: {
    givenName: string,
    familyName: string,
    fullName: string,
  },
  phones?: { value: string, type: string }[],
}