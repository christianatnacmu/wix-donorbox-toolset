/**
 * Toolset for Donorbox Donation Forms
 * Christian Berkman 2022
 */

import {fetch} from 'wix-fetch'

const embedUrl = 'https://donorbox.org/embed/';
const hideMeter = 'hide_donation_meter=true';
const meterOnly = 'only_donation_meter=true';

/**
 * Return URL to embed a donorbox form
 * @param string campaignName Donorbox Campaign Name
 * @param obj fields Field values
 * @param bool showMeter Show the donation meter
 * @return string
 */
export function embedFormUrl(campaignName, fields, showMeter = false){  
    var params = new URLSearchParams(fields).toString()
    if(showMeter == false) params = params + '&' + hideMeter

    return embedUrl + campaignName + '?' + params
}

/**
 * Return URL to embed a donorbox donation meter
 * @param string campaignName Donorbox Campaign Name
 * @obj fields FIeld values
 */
export function embedMeterUrl(campaignName, fields){
    const params = new URLSearchParams(fields).toString()
    return embedUrl + campaignName + '?' + meterOnly + '&' + params
}

export async function getMeterValues(campaignName){
    // Return object
    var returnObj = {
        currencySymbol: null,
        raised: null,
        donations: null,
        goal: null
    }

    // Get Meter HTML content
    const meterUrl = embedMeterUrl(campaignName)
    const response = await fetch(meterUrl)
    const html = await response.text()

    // Goal and Currencty Code
    const goalPattern = /([€$])\s?([0-9.,]+)<\/p><p>Goal/g;
    const goalMatches = goalPattern.exec(html)
    if(goalMatches != null){
        returnObj.currencySymbol = goalMatches[1]
        returnObj.goal = parseAmountToFloat(goalMatches[2], returnObj.currencySymbol)
    }
    
    // Amount Raised
    const raisedPattern = /([0-9.,]+)<\/p><p>Raised/g;
    const raisedMatches = raisedPattern.exec(html)
    if(raisedMatches != null) returnObj.raised = parseAmountToFloat(raisedMatches[1], returnObj.currencySymbol)

    // Donations
    const donationsPattern = /([0-9])<\/p><p>Donations/g;
    const donanationsMatches = donationsPattern.exec(html)
    if(donanationsMatches != null) returnObj.donations = parseInt(donanationsMatches[1])

    return returnObj
}

/**
 * Parse amount in EUR or USD to float
 * @param string amountString  Amount as String
 * @param string currencySymbol Currency Symbol
 * @return float
 */
function parseAmountToFloat(amountString, currencySymbol){
    switch(currencySymbol){
        default: // format unkown
            return parseFloat(amountString)
        break;

        case '€': // format: 12.345,67
            return parseFloat( amountString.replace('.', '').replace(',', '.') )
        break;

        case '$': // format: 12,345.67
            return parseFloat(amountString.replace(',', ''));
        break;
    }
}

