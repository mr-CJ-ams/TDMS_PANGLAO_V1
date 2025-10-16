// src/utils/regions.js

const regions = {
    PHILIPPINE_RESIDENTS: "Philippine Residents",
    NON_PHILIPPINE_RESIDENTS: "Non-Philippine Residents",
    ASIA: {
      ASEAN: ["Brunei", "Cambodia", "Indonesia", "Laos", "Malaysia", "Myanmar", "Singapore", "Thailand", "Vietnam"],
      EAST_ASIA: ["China", "Hong Kong", "Japan", "Korea", "Taiwan"],
      SOUTH_ASIA: ["Bangladesh", "India", "Iran", "Nepal", "Pakistan", "Sri Lanka"],
    },
    MIDDLE_EAST: ["Bahrain", "Egypt", "Israel", "Jordan", "Kuwait", "Saudi Arabia", "United Arab Emirates"],
    AMERICA: {
      NORTH_AMERICA: ["Canada", "Mexico", "USA"],
      SOUTH_AMERICA: ["Argentina", "Brazil", "Colombia", "Peru", "Venezuela"],
    },
    EUROPE: {
      WESTERN_EUROPE: ["Austria", "Belgium", "France", "Germany", "Luxembourg", "Netherlands", "Switzerland"],
      NORTHERN_EUROPE: ["Denmark", "Finland", "Ireland", "Norway", "Sweden", "United Kingdom"],
      SOUTHERN_EUROPE: ["Greece", "Italy", "Portugal", "Spain", "Union of Serbia and Montenegro"],
      EASTERN_EUROPE: ["Poland", "Russia"],
    },
    AUSTRALASIA_PACIFIC: ["Australia", "Guam", "Nauru", "New Zealand", "Papua New Guinea"],
    AFRICA: ["Nigeria", "South Africa"],
    OTHERS: ["Others and Unspecified Residences"],
  };
  
  export default regions;
