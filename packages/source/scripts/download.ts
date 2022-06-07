import * as cheerio from "cheerio";
import * as fs from "fs/promises";
import { fetch } from "node-fetch-native";
import pMap from "p-map";
import * as path from "path";

function cwd(...args: string[]) {
  return path.resolve(process.cwd(), ...args);
}

async function mapper(url: string) {
  console.log(`> [ start ] ${url}`);

  const content = await fetch(url).then((res) => res.text());
  if (!content.startsWith("<svg")) {
    return console.log(`> [ skip  ] ${url}`);
  }

  const filename = url.split("/").pop()!.replace("-logo", "");
  const filepath = path.resolve(process.cwd(), `assets/${filename}`);
  await fs.writeFile(filepath, content, { encoding: "utf-8" });

  console.log(`> [ done  ] ${url}`);
}

async function download() {
  await fs.mkdir(cwd("assets"));

  const content = await fetch("https://cryptologos.cc/logos/").then((res) => res.text());
  const $ = cheerio.load(content);
  const nodes = $("a[href*=svg]");
  const urls = nodes.map((_, node) => node.attribs.href?.replace(/\?v=\d+/, "")).toArray();

  await pMap(urls, mapper, { concurrency: 4 });
}

void download();
