import ktdbcl from "./crawler/ktdbcl";
import pdt from "./crawler/pdt";
import { CronJob } from "cron";
import axios from "axios";
import moment from "moment";
const webhookUrl =
  "https://discord.com/api/webhooks/953867702408196186/yCsbanrR1hDTY8GWjBdx4TZPoG5Y9scVdaTS69cxDhcSoaOligOHModx7mlwVUO8fYrn";

async function Job() {
  console.log("Run  job at", moment().format("HH:mm:ss DD-MM-YYYY"));
  const embeds: any = [];
  let data = await ktdbcl();
  for (const item of data) {
    const embed = {
      title: item.title,
      url: item.link,
      color: 1716573,
      author: {
        name: item.author,
        url: item.authorLink,
      },
      footer: {
        text: item.category,
      },
      timestamp: item.pubDate.toISOString(),
      thumbnail: {
        url: "https://inkythuatso.com/uploads/thumbnails/800/2021/12/logo-khoa-hoc-tu-nhien-inkythuatso-01-25-16-15-49.jpg",
      },
    };
    embeds.push(embed);
  }
  data = await pdt();
  for (const item of data) {
    const embed = {
      title: item.title,
      url: item.link,
      color: 16448250,
      author: {
        name: item.author,
        url: item.authorLink,
      },
      footer: {
        text: item.category,
      },
      timestamp: item.pubDate.toISOString(),
      thumbnail: {
        url: "https://inkythuatso.com/uploads/thumbnails/800/2021/12/logo-khoa-hoc-tu-nhien-inkythuatso-01-25-16-15-49.jpg",
      },
    };
    embeds.push(embed);
  }
  if (embeds.length > 0) {
    axios.post(webhookUrl, { embeds }).then(() => {
      console.log(`Send ${embeds.length} embeds`);
    });
  } else {
    console.log("No new data");
  }
}

var job = new CronJob("*/5 * * * *", Job, null, true);
job.start();
