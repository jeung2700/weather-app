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

const icons = {
  location: "assets/location.svg",
  rain: "assets/location.rain.svg",
};

const API_KEY = "";
const API = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Kuala%20Lumpur%2C%20Malaysia/next7days?key=${API_KEY}`;

let weatherData = null;

const weatherIcons = {
  rain: rainIcon,
  fog: rainIcon,
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

const formatTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(":");
  const h = Number(hours);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12} : ${minutes} ${period}`;
};

const el = (tag, cls, attrs = {}) => {
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

const next8Hours = (weatherData) => {
  const { days } = weatherData;
  return {
    // todo
  };
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

  currentTemperature.appendChild(el("span", "degree", { text: "°" }));

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
};

const render = () => {
  renderHeader();
  renderCurrentConditions();
  renderDetails();
  renderHourly();
};

render();
