import { NightwatchBrowser } from "nightwatch";

module.exports = {
    'WriteBetter Test Doc': function (browser: NightwatchBrowser) {
        browser
            .url('https://docs.google.com/document/d/1KX_6FahTxjSIDIh07LdfIt4dfik0_S1OTzNvQsD3YOc')
            .waitForElementVisible('body')
            .pause(500)
            .assert.containsText('body', 'WriteBetter Test Doc')
            .end();
    }
};