import dotenv from "dotenv";
// import cron from "node-cron";
import Parser from "rss-parser";
// import { jornadaFutbol } from "./ai/jornada_futbol";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const parser = new Parser();

async function jornadaFutbol(data: string) {
  const { text } = await generateText({
    model: google("gemini-2.5-flash-preview-05-20"),
    system:
      "Tu rol es el de resumir de forma concisa  las noticias que se te pasan que van a ser siempre del dia de la fecha",
    prompt: data,
  });
  return text;
}

async function sendTelegramMessage(message: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      //   parse_mode: "MarkdownV2",
    }),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${error}`);
  }
}

async function readRssFeed() {
  const feed = await parser.parseURL(
    "http://www.ole.com.ar/rss/futbol-primera/"
  );
  //   console.log(feed);
  return feed.items.map((item) => ({
    title: item.title,
    content: item.content || item.contentSnippet || item.summary || "",
    link: item.link,
  }));
}

function escapeMarkdownV2(text: string) {
  return text.replace(/([_*[\]()~`>#+=|{}.!-])/g, "\\$1");
}

async function main() {
  const texto = await readRssFeed();
  const parse = escapeMarkdownV2(JSON.stringify(texto));
  const jornada = await jornadaFutbol(parse);
  await sendTelegramMessage(jornada);

  console.log(jornada);
  process.exit(0); // Fuerza la salida exitosa
}

main();
