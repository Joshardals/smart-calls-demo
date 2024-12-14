export interface SocialContent {
  title: string;
  options: {
    title: string;
    steps: string[];
  }[];
  note?: string;
}

export interface Social {
  id: number;
  label: string;
  src: string;
  content?: SocialContent;
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
