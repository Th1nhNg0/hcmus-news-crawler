// src url: https://hcmus.edu.vn/%C4%91%C3%A0o-t%E1%BA%A1o/daotao
// data path: data/pdt.json

import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";
import { INew } from "../types";
import moment from "moment";

const data_path = "data/pdt.json";
type CategoryType = "DHCQ" | "CD" | "TSV" | "LTDH" | "DTTX" | "VLVH";
type StoragedataType = {
  [key in CategoryType]: INew[];
};

const catName = {
  DHCQ: "ĐẠI HỌC CHÍNH QUY",
  CD: "CAO ĐẲNG",
  TSV: "TÂN SINH VIÊN",
  LTDH: "LIÊN THÔNG ĐẠI HỌC",
  DTTX: "ĐÀO TẠO TỪ XA",
  VLVH: "VỪA LÀM VỪA HỌC",
};

let cacheResponse: any;
async function getDataFromWeb(catType: CategoryType = "DHCQ") {
  const url = `https://hcmus.edu.vn/%C4%91%C3%A0o-t%E1%BA%A1o/daotao`;
  let response;
  if (!cacheResponse) response = await axios.get(url);
  else response = cacheResponse;
  const $ = cheerio.load(response.data, { xmlMode: true });
  const cats = $(".sppb-col-md-4");
  const data: INew[] = [];
  for (let cat of cats) {
    if (catName[catType] === $(cat).find(".sppb-addon-title").text()) {
      const subCats = $(cat).find(".sppb-nav-custom li a");
      const subCatNames = [];
      for (let subCat of subCats) {
        subCatNames.push($(subCat).text().trim());
      }
      const subDataCats = $(cat).find(".category-module");
      for (let i = 0; i < subDataCats.length; i++) {
        const subDataCat = subDataCats[i];
        for (let subCat of $(subDataCat).find("li")) {
          const title = $(subCat)
            .find(".mod-articles-category-title")
            .text()
            .trim();
          const link = $(subCat)
            .find(".mod-articles-category-title")
            .attr("href");
          const pubDateString = $(subCat)
            .find(".mod-articles-category-date")
            .text()
            .replace("(", "")
            .replace(")", "")
            .trim();
          if (link == undefined) {
            continue;
          }
          const dateMomentObject = moment(pubDateString, "DD-MM-YYYY");
          const pubDate = dateMomentObject.toDate();
          const item: INew = {
            title,
            link: "https://hcmus.edu.vn" + link,
            pubDate,
            category: `${catName[catType]} - ${subCatNames[i]}`,
            author: "Phòng Đào Tạo",
            authorLink: "https://hcmus.edu.vn/%C4%91%C3%A0o-t%E1%BA%A1o/daotao",
          };
          data.push(item);
        }
      }
    }
  }
  return data;
}

async function getData() {
  // read file or create file is not exit
  cacheResponse = undefined;
  let storagedata: StoragedataType;
  if (fs.existsSync(data_path)) {
    storagedata = JSON.parse(fs.readFileSync(data_path, "utf8"));
  } else {
    storagedata = {
      DHCQ: [],
      CD: [],
      TSV: [],
      LTDH: [],
      DTTX: [],
      VLVH: [],
    };
  }
  const newData: INew[] = [];
  const cat: CategoryType[] = ["DHCQ", "CD", "TSV", "LTDH", "DTTX", "VLVH"];
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
