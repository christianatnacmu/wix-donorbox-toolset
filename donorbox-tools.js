/**
 * Toolset for Donorbox Donation Forms
 * Christian Berkman 2022
 */

import {fetch} from 'wix-fetch'

const embedUrl = 'https://donorbox.org/embed/';
const formUrl = 'https://donorbox.org/';
const hideMeter = 'hide_donation_meter=true';
const meterOnly = 'donation_meter_color=%23000&only_donation_meter=true';

/**
 * Return URL to embed a donorbox form
 * @param string campaignName Donorbox Campaign Name
 * @param obj fields Field values
 * @param bool showMeter Show the donation meter
 * @return string
 */
export function donorboxEmbedUrl(campaignName, fields, showMeter = false){  
    var params = new URLSearchParams(fields).toString()
    if(showMeter == false) params = params + '&' + hideMeter

    return embedUrl + campaignName + '?' + params
}

/**
 * Return URL to a donorbox from
 * @param string campaignName Donorbox Campaign Name
 * @param obj fields Field values
 * @param bool showMeter Show the donation meter
 * @return string
 */
export function donorboxFormUrl(campaignName, fields, showMeter = false){  
    var params = new URLSearchParams(fields).toString()
    if(showMeter == false) params = params + '&' + hideMeter

    return formUrl + campaignName + '?' + params
}

/**
 * Return URL to embed a donorbox donation meter
 * @param string campaignName Donorbox Campaign Name
 * @obj fields FIeld values
 */
export function donorboxEmbedMeterUrl(campaignName, fields){
    const params = new URLSearchParams(fields).toString()
    return embedUrl + campaignName + '?' + meterOnly + '&' + params
}

/**
 * Return meter values (goal, amount raised, donations, currency code) as JSON object
 * @param string campaignName Campaign Name
 */
export async function donorboxGetMeterValues(campaignName){
    // Return object
    var returnObj = {
        currencySymbol: null,
        raised: null,
        donations: null,
        goal: null,
        progress: null
    }

    // Get Meter HTML content
    const meterUrl = donorboxEmbedMeterUrl(campaignName, { 'language': 'en', 'time': Date.now() })
    const response = await fetch(meterUrl)
    const html = await response.text()

    // Goal, Currencty Symbol, Raised
    const triplePattern = /raised'><b>([€$])\s?([0-9.,]+)<\/b>\s?\/\s?[€$]\s?([0-9.,]+)/g
    const tripleMatches = triplePattern.exec(html)
    if(tripleMatches != null){
        returnObj.currencySymbol = tripleMatches[1]
        returnObj.raised = parseAmountToFloat(tripleMatches[2])
        returnObj.goal = parseAmountToFloat(tripleMatches[3])
    }

    // Donations
    const donationsPattern = /([0-9]+)\s?Donations?/g;
    const donanationsMatches = donationsPattern.exec(html)
    if(donanationsMatches != null) returnObj.donations = parseInt(donanationsMatches[1])

    // Progress
    if(returnObj.goal != null && returnObj.raised != null) returnObj.progress = parseInt( (returnObj.raised / returnObj.goal) * 100 )

    return returnObj
}

/**
 * Parse amount to float without knowing type of thousands seperator or decimal point
 * @param any amount Amount to parse (like 10.500,99 or 12,500/=)
 * @return float
 */
function parseAmountToFloat(amount){
	// Return amount if already a number float
	if(typeof(amount) == 'number') return amount;

	// Remove all characters except numbers, '.' and ','
	let amountStr = amount.toString()
	const cleanStr = amountStr.replace(/[^0-9.,]/g, '')

	// Search for decimal point in cleanStr
	const decimalPoint = cleanStr.charAt( cleanStr.length - 3)

	// Extract only integers from cleanStr
	const amountInt = parseInt( cleanStr.replace(/[^0-9]/g, '') )

	// Create float from amountInt
	let amountFloat

		// Decimal Point found
		if(decimalPoint == ',' || decimalPoint == '.'){
			// Divide by 100 cents to make float
			amountFloat = parseFloat( amountInt / 100)
		}
		// Decimal point not found
		else{
			// Create float from amountInt
			amountFloat = parseFloat(amountInt)
		}

	return amountFloat
}
