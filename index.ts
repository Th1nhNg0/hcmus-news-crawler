import { CronJob } from "cron";
import axios from "axios";
import moment from "moment";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
import ktdbcl from "./crawler/ktdbcl";
import pdt from "./crawler/pdt";
import math from "./crawler/math";

const webhookUrl = process.env.DISCORD_WEBHOOK as string;

async function Job() {
  console.log("Run  job at", moment().format("HH:mm:ss DD-MM-YYYY"));
  let embeds: any = [];

  //ktdbcl
  let data = await ktdbcl();
  for (const item of data) {
    const embed = {
      title: item.title,
      url: item.link,
      color: 1716573,
      author: {
        name: item.author,
        url: item.authorLink,
        icon_url:
          "https://inkythuatso.com/uploads/thumbnails/800/2021/12/logo-khoa-hoc-tu-nhien-inkythuatso-01-25-16-15-49.jpg",
      },
      footer: {
        text: item.category,
      },
      timestamp: item.pubDate.toISOString(),
    };
    embeds.push(embed);
  }
  //pdt
  data = await pdt();
  for (const item of data) {
    const embed = {
      title: item.title,
      url: item.link,
      color: 16448250,
      author: {
        name: item.author,
        url: item.authorLink,
        icon_url:
          "https://inkythuatso.com/uploads/thumbnails/800/2021/12/logo-khoa-hoc-tu-nhien-inkythuatso-01-25-16-15-49.jpg",
      },
      footer: {
        text: item.category,
      },
      timestamp: item.pubDate.toISOString(),
    };
    embeds.push(embed);
  }
  //math
  data = await math();
  for (const item of data) {
    const embed = {
      title: item.title,
      url: item.link,
      color: 44527,
      author: {
        name: item.author,
        url: item.authorLink,
        icon_url: "https://www.math.hcmus.edu.vn/images/Logo-Math-CS.png",
      },
      footer: {
        text: item.category,
      },
      timestamp: item.pubDate.toISOString(),
    };
    embeds.push(embed);
  }

  if (embeds.length > 0) {
    // send to discord but limit to 10 embeds
    embeds = embeds.sort((a: any, b: any) =>
      a.timestamp > b.timestamp ? -1 : 1
    );
    if (embeds.length > 10) {
      embeds = embeds.slice(0, 10);
    }
    embeds = embeds.reverse();
    axios.post(webhookUrl, { embeds }).then(() => {
      console.log(`Send ${embeds.length} embeds`);
    });
  } else {
    console.log("No new data");
  }
}

if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data");
}
var job = new CronJob(
  "*/5 * * * *",
  Job,
  null,
  true,
  "Asia/Ho_Chi_Minh",
  null,
  true
);
job.start();
