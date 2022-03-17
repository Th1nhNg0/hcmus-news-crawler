// src url: http://ktdbcl.hcmus.edu.vn/
// data path: data/ktdbcl.json

import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";
import { INew } from "../types";

const data_path = "data/ktdbcl.json";
type CategoryType = "THONGBAO" | "LICHTHI" | "KETQUATHI" | "PHUCKHAO";
type StoragedataType = {
  [key in CategoryType]: INew[];
};
const urlPath = {
  THONGBAO: "thong-bao",
  LICHTHI: "cong-tac-kh-o-thi/l-ch-thi-h-c-ky",
  KETQUATHI: "cong-tac-kh-o-thi/k-t-qu-thi-h-c-ky",
  PHUCKHAO: "cong-tac-kh-o-thi/k-t-qu-phuc-tra",
};

async function getDataFromWeb(catType: CategoryType = "THONGBAO") {
  const url = `http://ktdbcl.hcmus.edu.vn/index.php/${urlPath[catType]}?format=feed&type=rss`;
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
      author: "Phòng Khảo thí và Đảm bảo Chất lượng",
      authorLink: "http://ktdbcl.hcmus.edu.vn/",
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
      THONGBAO: [],
      LICHTHI: [],
      KETQUATHI: [],
      PHUCKHAO: [],
    };
  }
  const newData: INew[] = [];
  const cat: CategoryType[] = ["THONGBAO", "LICHTHI", "KETQUATHI", "PHUCKHAO"];
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
