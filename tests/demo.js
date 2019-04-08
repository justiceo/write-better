module.exports = {
    'Demo test Google': function (browser) {
        browser
            .url('http://www.google.com')
            .waitForElementVisible('body')
            .setValue('input[type=text]', 'nightwatch')
            .waitForElementVisible('input[name=btnK]')
            .click('input[name=btnK]')
            .pause(10000)
            .assert.containsText('#main', 'Night Watch')
            .end();
    }
};