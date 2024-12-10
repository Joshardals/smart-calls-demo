import { Client, Databases } from "node-appwrite";

const {
  NEXT_PUBLIC_APPWRITE_ENDPOINT,
  NEXT_PUBLIC_APPWRITE_PROJECT,
  APPWRITE_API_KEY,
} = process.env;

const client = new Client()
  .setEndpoint(NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
  .setProject(NEXT_PUBLIC_APPWRITE_PROJECT as string)
  .setKey(APPWRITE_API_KEY as string);

export const databases = new Databases(client);
