import moment from "moment";

const dateMomentObject = moment("18-03-2022", "DD-MM-YYYY");
const now = moment();
dateMomentObject.hour(now.hour());
dateMomentObject.minute(now.minute());
dateMomentObject.second(now.second());

const pubDate = dateMomentObject.toDate();
console.log(dateMomentObject);
console.log(pubDate);
