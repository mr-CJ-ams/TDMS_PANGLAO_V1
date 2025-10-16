
// src/utils/processNationalityCounts.js

import regions from "./regions";

const processNationalityCounts = (nationalityCounts) => {
    const result = {
      PHILIPPINE_RESIDENTS: 0,
      NON_PHILIPPINE_RESIDENTS: 0,
      OVERSEAS_FILIPINOS: 0,
      ASIA: {
        ASEAN: {},
        EAST_ASIA: {},
        SOUTH_ASIA: {},
        SUBTOTAL: 0,
      },
      MIDDLE_EAST: {},
      AMERICA: {
        NORTH_AMERICA: {},
        SOUTH_AMERICA: {},
        SUBTOTAL: 0,
      },
      EUROPE: {
        WESTERN_EUROPE: {},
        NORTHERN_EUROPE: {},
        SOUTHERN_EUROPE: {},
        EASTERN_EUROPE: {},
        SUBTOTAL: 0,
      },
      AUSTRALASIA_PACIFIC: {},
      AFRICA: {},
      OTHERS: {},
    };
  
    // Helper function to add counts to a region
    const addCount = (region, country, count) => {
      if (!region[country]) region[country] = 0;
      region[country] += count;
    };
  
    // Process each nationality
    nationalityCounts.forEach(({ nationality, count }) => {
      const parsedCount = parseInt(count, 10); // Ensure count is a number
  
      if (nationality === "Philippines") {
        result.PHILIPPINE_RESIDENTS += parsedCount;
      } else if (nationality === "Overseas Filipino") {
        result.OVERSEAS_FILIPINOS += parsedCount;
      } else {
        result.NON_PHILIPPINE_RESIDENTS += parsedCount;
  
        if (regions.ASIA.ASEAN.includes(nationality)) {
          addCount(result.ASIA.ASEAN, nationality, parsedCount);
          result.ASIA.SUBTOTAL += parsedCount;
        } else if (regions.ASIA.EAST_ASIA.includes(nationality)) {
          addCount(result.ASIA.EAST_ASIA, nationality, parsedCount);
          result.ASIA.SUBTOTAL += parsedCount;
        } else if (regions.ASIA.SOUTH_ASIA.includes(nationality)) {
          addCount(result.ASIA.SOUTH_ASIA, nationality, parsedCount);
          result.ASIA.SUBTOTAL += parsedCount;
        } else if (regions.MIDDLE_EAST.includes(nationality)) {
          addCount(result.MIDDLE_EAST, nationality, parsedCount);
        } else if (regions.AMERICA.NORTH_AMERICA.includes(nationality)) {
          addCount(result.AMERICA.NORTH_AMERICA, nationality, parsedCount);
          result.AMERICA.SUBTOTAL += parsedCount;
        } else if (regions.AMERICA.SOUTH_AMERICA.includes(nationality)) {
          addCount(result.AMERICA.SOUTH_AMERICA, nationality, parsedCount);
          result.AMERICA.SUBTOTAL += parsedCount;
        } else if (regions.EUROPE.WESTERN_EUROPE.includes(nationality)) {
          addCount(result.EUROPE.WESTERN_EUROPE, nationality, parsedCount);
          result.EUROPE.SUBTOTAL += parsedCount;
        } else if (regions.EUROPE.NORTHERN_EUROPE.includes(nationality)) {
          addCount(result.EUROPE.NORTHERN_EUROPE, nationality, parsedCount);
          result.EUROPE.SUBTOTAL += parsedCount;
        } else if (regions.EUROPE.SOUTHERN_EUROPE.includes(nationality)) {
          addCount(result.EUROPE.SOUTHERN_EUROPE, nationality, parsedCount);
          result.EUROPE.SUBTOTAL += parsedCount;
        } else if (regions.EUROPE.EASTERN_EUROPE.includes(nationality)) {
          addCount(result.EUROPE.EASTERN_EUROPE, nationality, parsedCount);
          result.EUROPE.SUBTOTAL += parsedCount;
        } else if (regions.AUSTRALASIA_PACIFIC.includes(nationality)) {
          addCount(result.AUSTRALASIA_PACIFIC, nationality, parsedCount);
        } else if (regions.AFRICA.includes(nationality)) {
          addCount(result.AFRICA, nationality, parsedCount);
        } else {
          addCount(result.OTHERS, nationality, parsedCount);
        }
      }
    });
  
    return result;
  };

export default processNationalityCounts;
