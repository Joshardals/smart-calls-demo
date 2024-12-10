"use server";
import { databases } from "@/lib/appwrite.config";
import { ID } from "node-appwrite";

const { DATABASE_ID, VISITORS_ID } = process.env;

interface VisitorData {
  timestamp: string;
  pathname: string;
  userAgent: string;
  referrer: string;
  screenResolution: string;
  deviceType: string;
  language: string;
  visitorId: string;
}

export async function createVisitorInfo(data: VisitorData) {
  try {
    await databases.createDocument(
      DATABASE_ID as string,
      VISITORS_ID as string,
      ID.unique(),
      {
        timestamp: data.timestamp,
        pathname: data.pathname,
        userAgent: data.userAgent,
        referrer: data.referrer,
        screenResolution: data.screenResolution,
        deviceType: data.deviceType,
        language: data.language,
        visitorId: data.visitorId,
      }
    );

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(
        `Failed to create Visitor document in the DB: ${error.message}`
      );
      return { success: false, msg: error.message };
    }
    console.log(`Failed to create Visitor document in the DB: Unknown error`);
    return { success: false, msg: "Unknown error occurred" };
  }
}
