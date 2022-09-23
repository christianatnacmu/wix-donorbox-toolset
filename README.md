# wix-donorbox-toolset
Simple toolset for Donorbox forms and meters without using Donorbox API

## Methods
### embedFormUrl(campaignName, fields, showMeter = false)
Returns URL to embed a donorbox form
`fields` should be a JSON object and will be appended as GET parameters

### embedMeterUrl(campaignName, fields)
Returns URL to embed the meter only
`fields` should be a JSON object and will be appended as GET parameters

### getMeterValues(campaignName)
Returns meter values (goal, amount raised, donations, currency code) as JSON object
This method fetches the meter HTML and uses regular expressions to extract the information.
