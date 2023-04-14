const axios = require('axios');
const dayjs = require('dayjs');
const colors = require('colors');

const getNightscoutToken = function (token) {
//  if (token.trim() !== '') {
  if (token !== '') {

//    return `&token=${token.trim()}`
    return `&token=${token}`
  }

  return '';
};

//2023-01-19: added filter &find[carbs][$gt]=0
const getNightscoutFoodEntries = async function (baseUrl, token, fromDate, toDate) {
  const url1 = `${baseUrl}/api/v1/treatments.json?find[created_at][$gte]=${fromDate}&find[created_at][$lte]=${toDate}&find[eventType]=Meal%20Bolus&find[carbs][$gt]=0&count=131072${getNightscoutToken(token)}`;
  console.log('entries url', url1.green);

  const response1 = await axios.get(url1, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data1 = response1.data.map(d => {
    return {
      id: parseInt(`2${dayjs(d['created_at']).format('YYYYMMDDHHmmss')}`),
      timestamp: d['created_at'],
      carbs: d.carbs,
      absorptionTime: d.absorptionTime,
      foodType: d.foodType
    };
  });

  const url2 = `${baseUrl}/api/v1/treatments.json?find[created_at][$gte]=${fromDate}&find[created_at][$lte]=${toDate}&find[eventType]=Carb%20Correction&find[carbs][$gt]=0&count=131072${getNightscoutToken(token)}`;
  console.log('entries url', url2.green);

  const response2 = await axios.get(url2, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data2 = response2.data.map(d => {
    return {
      id: parseInt(`2${dayjs(d['created_at']).format('YYYYMMDDHHmmss')}`),
      timestamp: d['created_at'],
      carbs: d.carbs,
      absorptionTime: d.absorptionTime,
      foodType: d.foodType
    };
  });

  //unites two types of: meal bolus and carb correction
  return [...data1, ...data2].map(e => {
    return {
      extendedProperties: {
        factoryTimestamp: e.timestamp
      },
      recordNumber: e.id,
      timestamp: dayjs(e.timestamp).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
      gramsCarbs: e.carbs,
      foodType: "Unknown"
    };
  });
};

const getNightscoutGlucoseEntries = async function (baseUrl, token, fromDate, toDate) {
  const url = `${baseUrl}/api/v1/entries.json?find[dateString][$gte]=${fromDate}&find[dateString][$lte]=${toDate}&count=131072${getNightscoutToken(token)}`;
  console.log('glucose entries url', url.gray);

  const response = await axios.get(url, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  //attention! every 3d value is taken into account
  const data = response.data.filter(function (value, index, Arr) {
    return index % 3 == 0;
  }).map(d => {
    return {
      id: parseInt(`1${dayjs(d.dateString).format('YYYYMMDDHHmmss')}`),
      sysTime: d.sysTime,
      dateString: d.dateString,
      sgv: d.sgv,
      delta: d.delta,
      direction: d.direction
    };
  });

  return data.map(e => {
    return {
      "extendedProperties": {
        "highOutOfRange": e.sgv >= 400 ? "true" : "false",
        "canMerge": "true",
        "isFirstAfterTimeChange": false,
        "factoryTimestamp": e.sysTime,
        "lowOutOfRange": e.sgv <= 40 ? "true" : "false"
      },
      "recordNumber": e.id,
      "timestamp": dayjs(e.dateString).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
      //sk > 7 ? (7 + (sk-7) * Math.pow(1-a, b*(sk-7))) : sk

      "valueInMgPerDl": e.sgv 
      //"valueInMgPerDl": e.sgv > (7*18) ? Math.round( (7 + ((e.sgv/18)-7) * Math.pow(1-0.1, 0.5*((e.sgv/18)-7)))*18 ) : e.sgv
	  // WARNING!!! This is my personal data calibration workaround DO NOT USE. Uncomment first line and comment second line

    };
  });
};

//2023-01-19: added filter &find[insulin][$gt]=0
const getNightscoutInsulinEntries = async function (baseUrl, token, fromDate, toDate) {
  const url1 = `${baseUrl}/api/v1/treatments.json?find[created_at][$gte]=${fromDate}&find[created_at][$lte]=${toDate}&find[eventType]=Correction%20Bolus&find[insulin][$gt]=0&count=131072${getNightscoutToken(token)}`;
  console.log('insulin entries url', url1.blue);

  const response1 = await axios.get(url1, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data1 = response1.data.map(d => {
    return {
      id: parseInt(`4${dayjs(d['created_at']).format('YYYYMMDDHHmmss')}`),
      timestamp: d['created_at'],
      insulin: d.insulin,
      duration: d.duration
    };
  });

  //2023.01.19: Changed Bolus to Meal Bolus due to AAPSv3.1 updated upload event id.
  const url2 = `${baseUrl}/api/v1/treatments.json?find[created_at][$gte]=${fromDate}&find[created_at][$lte]=${toDate}&find[eventType]=Meal%20Bolus&find[insulin][$gt]=0&count=131072${getNightscoutToken(token)}`;
  console.log('insulin entries url', url2.blue);

  const response2 = await axios.get(url2, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data2 = response2.data.map(d => {
    return {
      id: parseInt(`4${dayjs(d['created_at']).format('YYYYMMDDHHmmss')}`),
      timestamp: d['created_at'],
      insulin: d.insulin,
      duration: d.duration
    };
  });

  //unites two types of boluses
  return [...data1, ...data2].map(e => {
    return {
      extendedProperties: {
        factoryTimestamp: e.timestamp
      },
      recordNumber: e.id,
      timestamp: dayjs(e.timestamp).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
      units: e.insulin,
      insulinType: "RapidActing"
    };
  });
};

//
//Notes addition
const getNightscoutGenericEntries = async function (baseUrl, token, fromDate, toDate) {
  const url33 = `${baseUrl}/api/v1/treatments.json?find[created_at][$gte]=${fromDate}&find[created_at][$lte]=${toDate}&find[eventType]=Profile%20Switch&count=131072${getNightscoutToken(token)}`;
  console.log('profile switch entries url', url33.red);

  const response33 = await axios.get(url33, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  //const data33 = response33.data.filter(prof => prof.percentage <=185).map(d => {
  const data33 = response33.data.map(d => {
    return {
      type: "com.abbottdiabetescare.informatics.customnote",
	  id: parseInt(`6${dayjs(d['created_at']).format('YYYYMMDDHHmmss')}`),
      timestamp: d['created_at'],
      dateString: d.dateString,
      profile: d.profile
    };
  });
  console.log('data33 ===');  console.dir(data33);

  //===
  //Exercise addition
  const url44 = `${baseUrl}/api/v1/treatments.json?find[created_at][$gte]=${fromDate}&find[created_at][$lte]=${toDate}&find[eventType]=Exercise&count=131072${getNightscoutToken(token)}`;
  console.log('Exercise entries url', url44.gray);

  const response44 = await axios.get(url44, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data44 = response44.data.map(d => {
    return {
      type: "com.abbottdiabetescare.informatics.exercise",
	  id: parseInt(`6${dayjs(d['created_at']).format('YYYYMMDDHHmmss')}`),
      timestamp: d['created_at'],
      dateString: d.dateString,
      duration: d.duration
    };
  });
  console.log('data44 ===');   console.dir(data44);

  //===
  //Transform customnote to upload format
  tran33 = data33.map(e => {
    return {
      //type: "com.abbottdiabetescare.informatics.customnote",
      //type: "com.abbottdiabetescare.informatics.exercise",
	  type: e.type,
      extendedProperties: {
        factoryTimestamp: e.timestamp,
        //intensity: "high",
        //durationInMinutes: e.duration,
	    text: e.profile
      },
      recordNumber: e.id,
      timestamp: dayjs(e.timestamp).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    };
  });
  //Transform exercise to upload format
  tran44 = data44.map(e => {
    return {
      //type: "com.abbottdiabetescare.informatics.customnote",
      //type: "com.abbottdiabetescare.informatics.exercise",
	  type: e.type,
      extendedProperties: {
        factoryTimestamp: e.timestamp,
        intensity: "high",
        durationInMinutes: e.duration,
	    //text: e.profile
      },
      recordNumber: e.id,
      timestamp: dayjs(e.timestamp).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    };
  });
  console.log('SUM ==='); console.dir([...tran33, ...tran44]);

  return [...tran33, ...tran44];
  /*return data33.map(e => {
    return {
      //type: "com.abbottdiabetescare.informatics.customnote",
      //type: "com.abbottdiabetescare.informatics.exercise",
	  type: e.type,
      extendedProperties: {
        factoryTimestamp: e.timestamp,
        //intensity: "high",
        //durationInMinutes: e.duration,
	    text: e.profile
      },
      recordNumber: e.id,
      timestamp: e.timestamp.replace('Z','+03:00')
    };
  });
  */
  
};


exports.getNightscoutFoodEntries = getNightscoutFoodEntries;
exports.getNightscoutGlucoseEntries = getNightscoutGlucoseEntries;
exports.getNightscoutInsulinEntries = getNightscoutInsulinEntries;
exports.getNightscoutGenericEntries = getNightscoutGenericEntries;
