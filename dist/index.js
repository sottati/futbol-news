"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// import cron from "node-cron";
const rss_parser_1 = __importDefault(require("rss-parser"));
// import { jornadaFutbol } from "./ai/jornada_futbol";
const google_1 = require("@ai-sdk/google");
const ai_1 = require("ai");
dotenv_1.default.config();
// const PORT = process.env.PORT || 3000;
// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "1410899087";
// const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const parser = new rss_parser_1.default();
async function jornadaFutbol(data) {
    const { text } = await (0, ai_1.generateText)({
        model: (0, google_1.google)("gemini-2.5-flash-preview-05-20"),
        system: "Tu rol es el de resumir de forma concisa  las noticias que se te pasan que van a ser siempre del dia de la fecha",
        prompt: data,
    });
    return text;
}
async function readRssFeed() {
    const feed = await parser.parseURL("http://www.ole.com.ar/rss/futbol-primera/");
    //   console.log(feed);
    return feed.items.map((item) => ({
        title: item.title,
        content: item.content || item.contentSnippet || item.summary || "",
        link: item.link,
    }));
}
function escapeMarkdownV2(text) {
    return text.replace(/([_*[\]()~`>#+=|{}.!-])/g, "\\$1");
}
async function main() {
    const texto = await readRssFeed();
    const parse = escapeMarkdownV2(JSON.stringify(texto));
    const jornada = await jornadaFutbol(parse);
    console.log(jornada);
}
main();
