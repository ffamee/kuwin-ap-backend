export class CreateAccesspointDto {
  ip: string;
  radMac: string;
  ethMac: string;
  name: string;
  location: string;
  model: string;
  ios: string;
  serial: string;
  problem?: string;
}
