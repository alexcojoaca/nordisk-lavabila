import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Subscriber = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  phoneKey: string;
  passwordHash: string;
  cardCode: string;
  paid: boolean;
  createdAt: string;
};

export type Message = {
  id: string;
  name: string;
  contact: string;
  message: string;
  createdAt: string;
};

type Store = {
  subscribers: Subscriber[];
  messages: Message[];
};

type SubscriberRow = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  phone_key: string;
  password_hash: string;
  card_code: string;
  paid: boolean;
  created_at: string;
};

type MessageRow = {
  id: string;
  name: string;
  contact: string;
  message: string;
  created_at: string;
};

const empty = (): Store => ({ subscribers: [], messages: [] });

function setting(name: string) {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;
  const fromAstro = (import.meta.env as Record<string, string | undefined>)[name];
  return fromAstro || "";
}

export function databaseReady() {
  return Boolean(setting("SUPABASE_URL") && setting("SUPABASE_SERVICE_ROLE_KEY"));
}

let client: SupabaseClient | null = null;

function db() {
  if (!databaseReady()) return null;
  if (!client) {
    client = createClient(setting("SUPABASE_URL"), setting("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

function toSubscriber(row: SubscriberRow): Subscriber {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    phoneKey: row.phone_key,
    passwordHash: row.password_hash,
    cardCode: row.card_code,
    paid: row.paid,
    createdAt: row.created_at,
  };
}

function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact,
    message: row.message,
    createdAt: row.created_at,
  };
}

function filePath() {
  if (process.env.VERCEL) return "/tmp/nordisk-store.json";
  return join(process.cwd(), "data", "store.json");
}

function readFileStore(): Store {
  const path = filePath();
  if (!existsSync(path)) return empty();
  try {
    return { ...empty(), ...JSON.parse(readFileSync(path, "utf8")) };
  } catch {
    return empty();
  }
}

function writeFileStore(store: Store) {
  const path = filePath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(store, null, 2));
}

let queue = Promise.resolve();

function updateFile<T>(change: (store: Store) => T) {
  const run = queue.then(() => {
    const store = readFileStore();
    const result = change(store);
    writeFileStore(store);
    return result;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCardCode() {
  const bytes = randomBytes(6);
  let code = "NG-";
  for (let i = 0; i < 6; i += 1) code += alphabet[bytes[i] % alphabet.length];
  return code;
}

function cardCode(used: Set<string>) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = makeCardCode();
    if (!used.has(code)) return code;
  }
  return `NG-${Date.now().toString(36).toUpperCase()}`;
}

export function digits(value: string) {
  return value.replace(/\D/g, "");
}

export async function listSubscribers() {
  const supabase = db();
  if (!supabase) {
    return readFileStore().subscribers.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const { data, error } = await supabase.from("subscribers").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return ((data || []) as SubscriberRow[]).map(toSubscriber);
}

export async function listMessages() {
  const supabase = db();
  if (!supabase) {
    return readFileStore().messages.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return ((data || []) as MessageRow[]).map(toMessage);
}

export async function findSubscriber(id: string) {
  const supabase = db();
  if (!supabase) {
    return readFileStore().subscribers.find((item) => item.id === id) ?? null;
  }
  const { data, error } = await supabase.from("subscribers").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? toSubscriber(data as SubscriberRow) : null;
}

export async function findByPhone(phoneKey: string) {
  const supabase = db();
  if (!supabase) {
    return readFileStore().subscribers.find((item) => item.phoneKey === phoneKey) ?? null;
  }
  const { data, error } = await supabase.from("subscribers").select("*").eq("phone_key", phoneKey).maybeSingle();
  if (error) throw error;
  return data ? toSubscriber(data as SubscriberRow) : null;
}

export async function addSubscriber(input: {
  firstName: string;
  lastName: string;
  phone: string;
  phoneKey: string;
  passwordHash: string;
}) {
  const supabase = db();
  if (!supabase) {
    return updateFile((store) => {
      if (store.subscribers.some((item) => item.phoneKey === input.phoneKey)) return null;
      const subscriber: Subscriber = {
        id: randomBytes(12).toString("hex"),
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        phoneKey: input.phoneKey,
        passwordHash: input.passwordHash,
        cardCode: cardCode(new Set(store.subscribers.map((item) => item.cardCode))),
        paid: false,
        createdAt: new Date().toISOString(),
      };
      store.subscribers.push(subscriber);
      return subscriber;
    });
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const subscriber: Subscriber = {
      id: randomBytes(12).toString("hex"),
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      phoneKey: input.phoneKey,
      passwordHash: input.passwordHash,
      cardCode: makeCardCode(),
      paid: false,
      createdAt: new Date().toISOString(),
    };
    const { error } = await supabase.from("subscribers").insert({
      id: subscriber.id,
      first_name: subscriber.firstName,
      last_name: subscriber.lastName,
      phone: subscriber.phone,
      phone_key: subscriber.phoneKey,
      password_hash: subscriber.passwordHash,
      card_code: subscriber.cardCode,
      paid: subscriber.paid,
      created_at: subscriber.createdAt,
    });
    if (!error) return subscriber;
    if (error.code === "23505" && error.message.includes("phone_key")) return null;
    if (error.code === "23505" && error.message.includes("card_code")) continue;
    throw error;
  }
  return null;
}

export async function addMessage(input: { name: string; contact: string; message: string }) {
  const supabase = db();
  const message: Message = {
    id: randomBytes(12).toString("hex"),
    ...input,
    createdAt: new Date().toISOString(),
  };
  if (!supabase) {
    return updateFile((store) => {
      store.messages.push(message);
      return message;
    });
  }
  const { error } = await supabase.from("messages").insert({
    id: message.id,
    name: message.name,
    contact: message.contact,
    message: message.message,
    created_at: message.createdAt,
  });
  if (error) throw error;
  return message;
}

export async function setPaid(id: string, paid: boolean) {
  const supabase = db();
  if (!supabase) {
    return updateFile((store) => {
      const item = store.subscribers.find((entry) => entry.id === id);
      if (item) item.paid = paid;
      return item ?? null;
    });
  }
  const { data, error } = await supabase.from("subscribers").update({ paid }).eq("id", id).select("*").maybeSingle();
  if (error) throw error;
  return data ? toSubscriber(data as SubscriberRow) : null;
}

export async function deleteSubscriber(id: string) {
  const supabase = db();
  if (!supabase) {
    return updateFile((store) => {
      store.subscribers = store.subscribers.filter((item) => item.id !== id);
    });
  }
  const { error } = await supabase.from("subscribers").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteMessage(id: string) {
  const supabase = db();
  if (!supabase) {
    return updateFile((store) => {
      store.messages = store.messages.filter((item) => item.id !== id);
    });
  }
  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (error) throw error;
}

export async function updateProfile(
  id: string,
  input: { firstName: string; lastName: string; phone: string; phoneKey: string },
) {
  const supabase = db();
  if (!supabase) {
    return updateFile((store) => {
      const taken = store.subscribers.some((item) => item.phoneKey === input.phoneKey && item.id !== id);
      const item = store.subscribers.find((entry) => entry.id === id);
      if (!item || taken) return null;
      item.firstName = input.firstName;
      item.lastName = input.lastName;
      item.phone = input.phone;
      item.phoneKey = input.phoneKey;
      return item;
    });
  }

  const taken = await findByPhone(input.phoneKey);
  if (taken && taken.id !== id) return null;
  const { data, error } = await supabase
    .from("subscribers")
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
      phone_key: input.phoneKey,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? toSubscriber(data as SubscriberRow) : null;
}

export async function updatePassword(id: string, passwordHash: string) {
  const supabase = db();
  if (!supabase) {
    return updateFile((store) => {
      const item = store.subscribers.find((entry) => entry.id === id);
      if (!item) return null;
      item.passwordHash = passwordHash;
      return item;
    });
  }
  const { data, error } = await supabase
    .from("subscribers")
    .update({ password_hash: passwordHash })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? toSubscriber(data as SubscriberRow) : null;
}
