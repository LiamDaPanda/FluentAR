// Static requires so Metro can bundle these for the mobile app — fs/path
// are unavailable in React Native. Each course is one JSON file under courses/.

const en = require("./courses/en.json");
const ko = require("./courses/ko.json");
const ja = require("./courses/ja.json");
const fr = require("./courses/fr.json");
const es = require("./courses/es.json");
const pl = require("./courses/pl.json");

const coursesByLanguage = { en, ko, ja, fr, es, pl };
const availableLanguages = Object.keys(coursesByLanguage);

function getCourse(lang) {
  return coursesByLanguage[lang] || coursesByLanguage.en;
}

module.exports = {
  // courseData kept for back-compat with anything still importing the old export.
  courseData: en,
  coursesByLanguage,
  availableLanguages,
  getCourse,
};
