// src url: https://math.hcmus.edu.vn/tin-t%E1%BB%A9c/
// data path: data/ktdbcl.json

import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";
import { INew } from "../types";
import { createLanguageService } from "typescript";

const data_path = "data/math.json";
type CategoryType =
  | "TINGIAOVU"
  | "TINNGHIENCUU"
  | "TINHOCBONGVIECLAM"
  | "THONGTINTOANTINHOC"
  | "CUUSINHVIEN";
type StoragedataType = {
  [key in CategoryType]: INew[];
};
const urlPath = {
  TINGIAOVU: "tin-t%E1%BB%A9c/tin-gi%C3%A1o-v%E1%BB%A5",
  TINNGHIENCUU: "tin-t%E1%BB%A9c/tin-nghi%C3%AAn-c%E1%BB%A9u",
  TINHOCBONGVIECLAM:
    "tin-t%E1%BB%A9c/tin-h%E1%BB%8Dc-b%E1%BB%95ng-vi%E1%BB%87c-l%C3%A0m",
  THONGTINTOANTINHOC:
    "tin-t%E1%BB%A9c/th%C3%B4ng-tin-to%C3%A1n-tin-h%E1%BB%8Dc",
  CUUSINHVIEN:
    "quan-h%E1%BB%87-h%E1%BB%A3p-t%C3%A1c/c%E1%BB%B1u-sinh-vi%C3%AAn",
};
async function getDataFromWeb(catType: CategoryType = "TINGIAOVU") {
  const url = `https://math.hcmus.edu.vn/${urlPath[catType]}?format=feed&type=rss`;
  const response = await axios.get(url);
  const $ = cheerio.load(response.data, { xmlMode: true });
  const data: INew[] = [];
  for (let elem of $("item")) {
    const title = $(elem).find("title").text();
    const link = $(elem).find("link").text();
    const category = $(elem).find("category").text();
    const pubDate = new Date($(elem).find("pubDate").text());
    const item: INew = {
      title,
      link,
      pubDate,
      category,
      author: "Khoa Toán - Tin học",
      authorLink: "https://math.hcmus.edu.vn/",
    };
    data.push(item);
  }
  return data;
}

async function getData() {
  // read file or create file is not exit
  let storagedata: StoragedataType;
  if (fs.existsSync(data_path)) {
    storagedata = JSON.parse(fs.readFileSync(data_path, "utf8"));
  } else {
    storagedata = {
      TINGIAOVU: [],
      TINNGHIENCUU: [],
      TINHOCBONGVIECLAM: [],
      THONGTINTOANTINHOC: [],
      CUUSINHVIEN: [],
    };
  }
  const newData: INew[] = [];
  const cat: CategoryType[] = [
    "TINGIAOVU",
    "CUUSINHVIEN",
    "THONGTINTOANTINHOC",
    "TINHOCBONGVIECLAM",
    "TINNGHIENCUU",
  ];
  for (let c of cat) {
    const crawlData = await getDataFromWeb(c);
    for (let i = 0; i < crawlData.length; i++) {
      const item = crawlData[i];
      if (storagedata[c].find((e) => e.title === item.title)) {
        continue;
      }
      newData.push(item);
      storagedata[c].push(item);
    }
  }
  fs.writeFileSync(data_path, JSON.stringify(storagedata));
  return newData;
}

export default getData;
