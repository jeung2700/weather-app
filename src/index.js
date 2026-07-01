import "./styles.css";
import locationIcon from "./assets/icons/location.svg";
import rainIcon from "./assets/icons/rain.svg";
import cloudIcon from "./assets/icons/cloud.svg";
import sunIcon from "./assets/icons/sun.svg";
import stormIcon from "./assets/icons/storm.svg";
import cloudySunIcon from "./assets/icons/cloudy-sun.svg";
import snowFallIcon from "./assets/icons/snowfall.svg";
import moonIcon from "./assets/icons/moon.svg";
import cloudyMoonIcon from "./assets/icons/cloudy-moon.svg";
import fogIcon from "./assets/icons/fog.svg";

const API_KEY = "CJX9WR2QJ598HS9624H67NDEF";
const API = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Lisbon,Portugal/next7days?key=${API_KEY}`;

let weatherData = null;

const weatherIcons = {
  rain: rainIcon,
  fog: fogIcon,
  wind: sunIcon,
  cloudy: cloudIcon,
  "clear-day": sunIcon,
  "clear-night": moonIcon,
  "partly-cloudy-day": cloudySunIcon,
  "partly-cloudy-night": cloudyMoonIcon,
  snow: snowFallIcon,
};

const COMPASS_DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

const fetchAPI = async () => {
  try {
    const response = await fetch(API);
    if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch weather", error);
    return null;
  }
};

weatherData = await fetchAPI();
console.log(weatherData);

const formatDateTime = (epoch, timezone) => {
  const date = new Date(epoch * 1000);
  const datePart = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: timezone,
  });
  const timePart = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  });
  return `${datePart} · ${timePart}`;
};

const formatDay = (epoch, timezone) => {
  const date = new Date(epoch * 1000);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: timezone,
  });
};

const formatTime = (timeStr) => {
  //todo: merge with formattimehr
  const [hours, minutes] = timeStr.split(":");
  const h = Number(hours);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12} : ${minutes} ${period}`;
};

const formatTimeHr = (timeStr) => {
  const hours = timeStr.split(":")[0];
  const h = Number(hours);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12} ${period}`;
};

const el = (tag, cls, attrs = {}) => {
  //element creation helper
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "text") e.textContent = v;
    else e.setAttribute(k, v);
  });
  return e;
};

const degToCompass = (deg) => COMPASS_DIRS[Math.round(deg / 45) % 8];

const convertFtoC = (fahrenheit) => Math.round(((fahrenheit - 32) * 5) / 9);

const uvLabel = (uvNum) => {
  if (uvNum < 3) return "Low";
  if (uvNum < 6) return "Moderate";
  if (uvNum < 8) return "High";
  if (uvNum < 11) return "Very High";
  return "Extreme";
};

const buildDetails = (weatherData) => {
  const { currentConditions: cc } = weatherData;
  return {
    WIND: `${Math.round(cc.windspeed)} km/h ${degToCompass(cc.winddir)}`,
    HUMIDITY: `${cc.humidity}%`,
    "UV INDEX": `${cc.uvindex} · ${uvLabel(cc.uvindex)}`,
    VISIBILITY: `${cc.visibility} km`,
    PRESSURE: `${Math.round(cc.pressure)} hPa`,
    SUNRISE: formatTime(cc.sunrise),
  };
};

const build8Hours = (weatherData) => {
  const todayHours = weatherData.days[0].hours;
  const tomorrowHours = weatherData.days[1].hours;
  const allHours = [...todayHours, ...tomorrowHours];
  const currentHour = parseInt(weatherData.currentConditions.datetime, 10);
  return allHours.slice(currentHour, currentHour + 8).map((h) => ({
    time: formatTimeHr(h.datetime),
    icon: weatherIcons[h.icon.split(",")[0]],
    temp: Math.round(h.temp),
  }));
};

const build7days = (weatherData) => {
  const timezone = weatherData.timezone;
  return weatherData.days.slice(0, 7).map((d, i) => ({
    day: formatDay(d.datetimeEpoch, timezone),
    icon: weatherIcons[d.icon.split(",")[0]],
    "daily-low": Math.round(d.tempmin),
    "daily-high": Math.round(d.tempmax),
    "weekly-low": getWeeklyExtremes(weatherData).low,
    "weekly-high": getWeeklyExtremes(weatherData).high,
  }));
};

const getWeeklyExtremes = (weatherData) => {
  const daily = weatherData.days;
  const weeklyExtremes = daily.reduce(
    (acc, curr) => {
      if (curr.tempmax > acc.high) acc.high = Math.round(curr.tempmax);
      if (curr.tempmin < acc.low) acc.low = Math.round(curr.tempmin);
      return acc;
    },
    {
      high: -Infinity,
      low: Infinity,
    },
  );
  return weeklyExtremes;
};

const renderHeader = () => {
  const location = document.querySelector(".location-container");
  const time = document.querySelector(".date-time-container");
  location.appendChild(
    el("p", "location-text", {
      text: `${weatherData.address.split(",").join(", ")}`,
    }),
  );
  time.textContent = formatDateTime(
    weatherData.currentConditions.datetimeEpoch,
    weatherData.timezone,
  );
};

const renderCurrentConditions = () => {
  const currentCondition = document.querySelector(".current-condition");
  const currentTemperature = document.querySelector(".current-temperature");
  const currentFeel = document.querySelector(".current-feel");
  const currentDescription = document.querySelector(".current-description");
  const currentIcon = document.querySelector(".current-right");
  currentCondition.appendChild(
    el("img", "current-icon", {
      src: `${weatherIcons[weatherData.currentConditions.icon]}`,
    }),
  );
  currentCondition.appendChild(
    el("p", "current-condition-text", {
      text: `${weatherData.currentConditions.conditions}`,
    }),
  );
  currentTemperature.textContent = `${Math.round(
    weatherData.currentConditions.temp,
  )}`;
  currentTemperature.appendChild(
    el("span", "degree", {
      text: "°",
    }),
  );
  currentFeel.appendChild(
    el("span", "feel-text", {
      text: `Feels like ${Math.round(weatherData.days[0].feelslike)}°`,
    }),
  );
  currentFeel.appendChild(
    el("span", "feel-minmax", {
      text: `High ${Math.round(weatherData.days[0].feelslikemax)}°  ·  Low ${Math.round(weatherData.days[0].feelslikemin)}°`,
    }),
  );
  currentDescription.textContent = weatherData.description;
  currentIcon.appendChild(
    el("img", "current-icon-big", {
      src: `${weatherIcons[weatherData.currentConditions.icon]}`,
    }),
  );
};

const renderDetails = () => {
  const detailsContainer = document.querySelector(".details");
  const details = buildDetails(weatherData);
  Object.entries(details).forEach(([label, value]) => {
    const card = el("div", "detail-card");
    const cardTitle = el("p", "card-title", { text: label });
    const cardDesc = el("p", "card-value", { text: value });
    card.appendChild(cardTitle);
    card.appendChild(cardDesc);
    detailsContainer.appendChild(card);
  });
};

const renderHourly = () => {
  const hourlyContainer = document.querySelector(".hourly-card-container");
  const hourlyData = build8Hours(weatherData);
  hourlyData.forEach((d, i) => {
    const hourCard = el("div", "hourly-card");
    const timeText = i === 0 ? "NOW" : d.time;
    const hourlyTime = el("p", "hourly-time", { text: timeText });
    const hourlyIcon = el("img", "hourly-icon", { src: d.icon });
    const hourlyTemp = el("p", "hourly-temp", { text: `${d.temp}°` });
    hourCard.appendChild(hourlyTime);
    hourCard.appendChild(hourlyIcon);
    hourCard.appendChild(hourlyTemp);
    hourlyContainer.appendChild(hourCard);
  });
};

const renderDaily = () => {
  //tody + day, icons, weekly high/low, today highlow
  //css = today + day, icons, today high, bar, today low.
  const dailyContainer = document.querySelector(".daily-card-container");
  const dailyData = build7days(weatherData);
  dailyData.forEach((d, i) => {
    const dailyCard = el("div", "daily-card");
    const dayText = i === 0 ? "Today" : d.day;
    const dailyDay = el("p", "daily-day", { text: dayText });
    const dailyIcon = el("img", "daily-icon", { src: d.icon });
    const dailyMin = el("p", "daily-min", { text: d["daily-low"] });
    const dailyMax = el("p", "daily-max", { text: d["daily-high"] });
    const dailyRange = el("div", "range-bar");
    dailyCard.appendChild(dailyDay);
    dailyCard.appendChild(dailyIcon);
    dailyCard.appendChild(dailyMin);
    dailyCard.appendChild(dailyRange);
    dailyCard.appendChild(dailyMax);
    dailyContainer.appendChild(dailyCard);
  });
  console.log(build7days(weatherData));
};

const render = () => {
  renderHeader();
  renderCurrentConditions();
  renderDetails();
  renderHourly();
  renderDaily();
};

render();
