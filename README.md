# Transfer Nightscout data to LibreView
Transfer your diabetes data from Nightscout to LibreView.

## Requirements
- git
- nodejs

## First use


Open command line in your favorite folder:
```
git clone https://github.com/NicoAAPS/nightscout-to-libreview
cd nightscout-to-libreview
npm install

copy config-example.txt as config.json
fill file with your personal data (username, password, phone details and libreview sn, devicereset, fromyear, frommonth, fromday, deltaday)
change libreview endpoint api URL to your region at libre.js, current region is EU

start:
specify date:
node . 

```
## config.json

{"nightscoutUrl":"https://my.ns.ru","nightscoutToken":"my-toooooooookeeeeeeeen","libreUsername":"username@pochtampt.ru","librePassword":"password","libreDevice":"11111122-3333-4444-5555-666666666666","hardwareDescriptor":"Model","osVersion":"28","hardwareName":"Asus","libreResetDevice":"false","fromYear":"2023","fromMonth":"4","fromDay":"1","deltaDay":"30"}
## example run
Upload datad from 2023-04-01 to 2023-05-01
transfer time span 2023-04-01 2023-05-01
glucose entries url https://nightscout.url/api/v1/entries.json?find[dateString][$gte]=2023-04-01&find[dateString][$lte]=2023-05-01&count=131072&token=ns-token
entries url https://nightscout.url/api/v1/treatments.json?find[created_at][$gte]=2023-04-01&find[created_at][$lte]=2023-05-01&find[eventType]=Meal%20Bolus&find[carbs][$gt]=0&count=131072&token=ns-token
entries url https://nightscout.url/api/v1/treatments.json?find[created_at][$gte]=2023-04-01&find[created_at][$lte]=2023-05-01&find[eventType]=Carb%20Correction&find[carbs][$gt]=0&count=131072&token=ns-token
insulin entries url https://nightscout.url/api/v1/treatments.json?find[created_at][$gte]=2023-04-01&find[created_at][$lte]=2023-05-01&find[eventType]=Correction%20Bolus&find[insulin][$gt]=0&count=131072&token=ns-token
insulin entries url https://nightscout.url/api/v1/treatments.json?find[created_at][$gte]=2023-04-01&find[created_at][$lte]=2023-05-01&find[eventType]=Meal%20Bolus&find[insulin][$gt]=0&count=131072&token=ns-token
authLibreView
authLibreView, response undefined
transferLibreView
glucose entries 1232
food entries 132
insulin entries 54
transferLibreView, response undefined

## Diff from lisabeta branch:
- delta days may contain any number of date backward from today to upload
- commented out interactive part, only config.json required
- added hardwareDescriptor,osVersion,hardwareName as config params
- added fromyear, frommonth, fromday, deltaday as config params
  nightscout selection is from specified fromdate for the number of delta days
  
## Todo
- Change 1/3 data point transfer to rouding. Sometimes we get less that 96 datapoints.
- many many testing!
- better error handling
- add frequent unscheduledContinuousGlucoseEntries
- add basal insulin?!?
- different libreview api endpoints
