import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import {
  createGithubFile,
  deleteGithubFile,
  getGithubContent,
  updateGithubFile
} from "@/lib/github-admin";

export type InquiryMessage = {
  id: string;
  sender: "visitor" | "admin";
  body: string;
  createdAt: string;
};

export type ContactInquiry = {
  id: string;
  nickname: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  updatedAt: string;
  messages: InquiryMessage[];
};

export type ContactInquirySummary = {
  id: string;
  nickname: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: string;
  messageCount: number;
};

type EncryptedPayload = {
  iv: string;
  tag: string;
  data: string;
};

const inquiryDirectory = process.env.GITHUB_CONTACT_PATH || "content/private-inquiries";

function requiredContactSecret() {
  const secret = process.env.CONTACT_DATA_SECRET;

  if (!secret) {
    throw new Error("Missing environment variable: CONTACT_DATA_SECRET");
  }

  return secret;
}

function encryptionKey() {
  return createHash("sha256").update(requiredContactSecret()).digest();
}

function hashVisitorPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function verifyVisitorPassword(password: string, salt: string, hash: string) {
  const expected = Buffer.from(hash, "hex");
  const actual = Buffer.from(hashVisitorPassword(password, salt), "hex");

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function encryptInquiry(inquiry: ContactInquiry) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(inquiry), "utf8"),
    cipher.final()
  ]);
  const payload: EncryptedPayload = {
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    data: encrypted.toString("base64")
  };

  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

function decryptInquiry(source: string) {
  const payload = JSON.parse(source) as EncryptedPayload;
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(payload.iv, "base64"));
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.data, "base64")),
    decipher.final()
  ]).toString("utf8");

  return JSON.parse(decrypted) as ContactInquiry;
}

function filePath(id: string) {
  return `${inquiryDirectory}/${id}.json.enc`;
}

function decodeGithubSource(content: string) {
  return Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf8");
}

function publicInquiry(inquiry: ContactInquiry) {
  return {
    id: inquiry.id,
    nickname: inquiry.nickname,
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt,
    messages: inquiry.messages
  };
}

function appendMessage(inquiry: ContactInquiry, sender: "visitor" | "admin", body: string) {
  const now = new Date().toISOString();

  return {
    ...inquiry,
    updatedAt: now,
    messages: [
      ...inquiry.messages,
      {
        id: randomBytes(8).toString("hex"),
        sender,
        body,
        createdAt: now
      }
    ]
  };
}

export function summarizeInquiry(inquiry: ContactInquiry): ContactInquirySummary {
  const lastMessage = inquiry.messages[inquiry.messages.length - 1]?.body ?? "";

  return {
    id: inquiry.id,
    nickname: inquiry.nickname,
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt,
    lastMessage,
    messageCount: inquiry.messages.length
  };
}

export async function createInquiry({
  nickname,
  password,
  body
}: {
  nickname: string;
  password: string;
  body: string;
}) {
  const existing = await findVisitorInquiryEntry({ nickname, password });

  if (existing) {
    const nextInquiry = appendMessage(existing.inquiry, "visitor", body);
    await updateGithubFile(filePath(nextInquiry.id), existing.sha, encryptInquiry(nextInquiry), `Update contact inquiry ${nextInquiry.id}`);

    return publicInquiry(nextInquiry);
  }

  const now = new Date().toISOString();
  const id = randomBytes(10).toString("hex");
  const passwordSalt = randomBytes(16).toString("hex");
  const inquiry: ContactInquiry = {
    id,
    nickname,
    passwordSalt,
    passwordHash: hashVisitorPassword(password, passwordSalt),
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: randomBytes(8).toString("hex"),
        sender: "visitor",
        body,
        createdAt: now
      }
    ]
  };

  await createGithubFile(filePath(id), encryptInquiry(inquiry), `Add contact inquiry ${id}`);

  return publicInquiry(inquiry);
}

export async function readInquiry(id: string) {
  const file = await getGithubContent(filePath(id));

  if (!file || Array.isArray(file) || !file.content) {
    throw new Error("問い合わせが見つかりませんでした。");
  }

  return {
    inquiry: decryptInquiry(decodeGithubSource(file.content)),
    sha: file.sha
  };
}

export async function readVisitorInquiry({
  id,
  nickname,
  password
}: {
  id: string;
  nickname: string;
  password: string;
}) {
  const { inquiry } = await readInquiry(id);

  if (inquiry.nickname !== nickname || !verifyVisitorPassword(password, inquiry.passwordSalt, inquiry.passwordHash)) {
    throw new Error("ニックネームまたはパスワードが違います。");
  }

  return publicInquiry(inquiry);
}

async function listInquiryEntries() {
  const directory = await getGithubContent(inquiryDirectory);

  if (!Array.isArray(directory)) {
    return [];
  }

  const entries = await Promise.all(
    directory
      .filter((item) => item.type === "file" && item.name.endsWith(".json.enc"))
      .map(async (item) => {
        const file = await getGithubContent(item.path);

        if (!file || Array.isArray(file) || !file.content) {
          return null;
        }

        return {
          inquiry: decryptInquiry(decodeGithubSource(file.content)),
          sha: file.sha
        };
      })
  );

  return entries
    .filter((entry): entry is { inquiry: ContactInquiry; sha: string } => Boolean(entry))
    .sort((a, b) => new Date(b.inquiry.updatedAt).getTime() - new Date(a.inquiry.updatedAt).getTime());
}

async function findVisitorInquiryEntry({
  nickname,
  password
}: {
  nickname: string;
  password: string;
}) {
  const entries = await listInquiryEntries();

  return entries.find(({ inquiry }) => (
    inquiry.nickname === nickname && verifyVisitorPassword(password, inquiry.passwordSalt, inquiry.passwordHash)
  )) ?? null;
}

export async function findVisitorInquiry({
  nickname,
  password
}: {
  nickname: string;
  password: string;
}) {
  const entry = await findVisitorInquiryEntry({ nickname, password });

  if (!entry) {
    throw new Error("ニックネームまたはパスワードが違います。");
  }

  return publicInquiry(entry.inquiry);
}

export async function appendInquiryMessage({
  id,
  sender,
  body,
  nickname,
  password
}: {
  id: string;
  sender: "visitor" | "admin";
  body: string;
  nickname?: string;
  password?: string;
}) {
  const { inquiry, sha } = await readInquiry(id);

  if (sender === "visitor") {
    if (!nickname || !password || inquiry.nickname !== nickname || !verifyVisitorPassword(password, inquiry.passwordSalt, inquiry.passwordHash)) {
      throw new Error("ニックネームまたはパスワードが違います。");
    }
  }

  const nextInquiry = appendMessage(inquiry, sender, body);

  await updateGithubFile(filePath(id), sha, encryptInquiry(nextInquiry), `Update contact inquiry ${id}`);

  return publicInquiry(nextInquiry);
}

export async function deleteInquiry(id: string) {
  const { inquiry, sha } = await readInquiry(id);

  await deleteGithubFile(filePath(id), sha, `Delete contact inquiry ${id}`);

  return publicInquiry(inquiry);
}

export async function listInquiries() {
  const entries = await listInquiryEntries();

  return entries.map((entry) => entry.inquiry);
}

export function toPublicInquiry(inquiry: ContactInquiry) {
  return publicInquiry(inquiry);
}
