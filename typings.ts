export interface Social {
  id: number;
  label: string;
//   src: string;
  getShareUrl?: (url: string, text: string) => string;
}

export interface VisitorData {
  timestamp: string;
  pathname: string;
  userAgent: string;
  referrer: string;
  screenResolution: string;
  deviceType: string;
  language: string;
  visitorId: string;
}

export interface PresetTransaction {
  address: string;
  amount: number;
  displayOrder: number;
}
