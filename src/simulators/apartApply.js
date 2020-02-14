const db = require('./../db/connection');
require('chromedriver');
const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const config = require('./config.json');

let applyApart = {
    driver: null,
    searchParameters: {},
    run: async function() {

        const self = this;

        let chromeOptions = [
            '--test-type', 
            '--start-maximized',
            //'--incognito'
        ];

        this.driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().addArguments(chromeOptions)).build();
          
        try {
            await this.driver.get('https://www.immobilienscout24.de/');

            const loginLink = By.css('a.one-whole.sso-login-link.sso-login-link--no-parameters');

            self.driver.sleep(2000).then(function() {

                self.driver.findElement(loginLink).then(btn => {
                    
                    self.driver.executeScript("arguments[0].click();", btn).then(function() {

                        self.driver.wait(until.urlContains('sso/login?'), 2000).then(self.loggIn(), function(error) {
                            console.log('Login page not loading');
                        });

                    }, function(error) {
                        console.log('Login link not clickable');
                    });

                }, function(error) {
                    console.log('Can\'t find login link by css - a.one-whole.sso-login-link.sso-login-link--no-parameters');
                });
    
            });
            
        } finally {
            //await driver.quit();
            return;
        }

    },
    loggIn: function() {

        const self = this;
        const googleLoginBtn = By.xpath('//div[@id="googleButtonLinkLogin"]/a');

        self.driver.findElement(googleLoginBtn).then(btn => {
                    
            self.driver.executeScript("arguments[0].click();", btn).then(function() {

                self.driver.wait(until.urlContains('/signin/oauth/oauthchooseaccount?'), 2000).then(self.googleLoggIn(), function(error) {
                    console.log('Google login page not loading');
                });

            }, function(error) {
                console.log('Google login link not clickable');
            });

        }, function(error) {
            console.log('Can\'t find google login link by xpath - //div[@id="googleButtonLinkLogin"]/a');
        });

    },
    googleLoggIn: function () {

        const self = this;
        const googleAccountBtnNext = By.xpath('//div[@id="identifierNext"]');

        self.driver.wait(until.elementLocated(By.name('identifier')), 3000).then(function() {

            self.driver.findElement(By.name('identifier')).sendKeys(config.googleAccount.username);

            self.driver.findElement(googleAccountBtnNext).then(btn => {
                    
                self.driver.executeScript("arguments[0].click();", btn).then(function() {
    
                    self.driver.wait(until.elementLocated(By.name('password')), 3000).then(function() {
    
                        const googlePasswordBtnNext = By.xpath('//div[@id="passwordNext"]');

                        self.driver.sleep(3000).then(function() {

                            self.driver.findElement(By.name('password')).sendKeys(config.googleAccount.password);
    
                            self.driver.findElement(googlePasswordBtnNext).then(btn => {
        
                                self.driver.executeScript("arguments[0].click();", btn).then(function() {
        
                                    self.driver.wait(until.urlContains('/meinkonto/start'), 5000).then(self.runSavedSearch(), function(error) {
                                        console.log('Personal cabinet not loading');
                                    });
        
                                }, function(error) {
                                    console.log('oogle account password link next not clickable');
                                });
        
                            }, function(error) {
                                console.log('Can\'t find google account link password next by xpath - //div[@id="passwordNext"]');
                            });

                        });
    
    
                    }, function(error) {
                        console.log('Password field not loading');
                    });
    
                }, function(error) {
                    console.log('Google account link next not clickable');
                });
    
            }, function(error) {
                console.log('Can\'t find google account link next by xpath - //div[@id="identifierNext"]');
            });

        }, function(error) {
            console.log('Can\'t find google account email field');
        });

    },
    runSavedSearch: function() {

        const self = this;
        const searchLink = By.xpath('//div[contains(@class, "SavedSearches")]/a');

        self.driver.wait(until.elementLocated(searchLink), 8000).then(function() {

            self.driver.sleep(3000).then(function() {

                self.driver.findElement(searchLink).then(btn => {
                    
                    self.driver.executeScript("arguments[0].click();", btn).then(function() {
        
                        self.driver.wait(until.urlContains('/savedsearch/myscout/manage/'), 2000).then(function() {
        
                            const mainSearch = By.xpath('//a[contains(@class, "savedsearch-106712117-show")]');
        
                            self.driver.findElement(mainSearch).then(btn => {
                            
                                self.driver.executeScript("arguments[0].click();", btn).then(function() {
                    
                                    self.driver.wait(until.urlContains('/Suche/shape/wohnung-mieten?'), 2000).then(self.findNewAparts(), function(error) {
                                        console.log('Main search not loading');
                                    });
                    
                                }, function(error) {
                                    console.log('main search link not clickable');
                                });
                    
                            }, function(error) {
                                console.log('Can\'t find main search link by xpath - //a[contains(@class, "savedsearch-106712117-show")]');
                            });
        
                        }, function(error) {
                            console.log('Saved searches not loading');
                        });
        
                    }, function(error) {
                        console.log('saved searches link not clickable');
                    });
        
                });

            });

        }, function(error) {
            console.log('Can\'t find saved searches link by xpath - //div[contains(@class, "SavedSearches")]/a');
        });

    },
    findNewAparts: function(start) {

        const self = this;

        self.driver.navigate().refresh();

        self.driver.sleep(8000).then(function() {

            let scrollListBottom = function() {
                window.scrollTo(0,document.body.scrollHeight);
            };

            self.driver.executeScript(scrollListBottom).then(function() {
                self.driver.sleep(3000).then(function() {
                    self.selectApart(start ? start : 0);
                });
            });

        });
            
    },
    selectApart: function(start) {

        const self = this;
        const list = By.xpath('//ul[@id="resultListItems"]');

        self.driver.wait(until.elementLocated(list), 3000).then(function(webElement) {

            webElement.findElements(By.css('.result-list-entry__data-container')).then(async function(jobsArray) {

                console.log(jobsArray.length);
                console.log(start);

                if (start < jobsArray.length) {
                    jobsArray[start].findElement(By.css('.result-list-entry__new-flag')).then(async id => {
                        console.log('found');

                        const url = await jobsArray[start].findElement(By.css('a.result-list-entry__brand-title-container')).getAttribute('href');
                        const appartId = url.substring(url.lastIndexOf('/') + 1);

                        console.log(url);
                        console.log(appartId);

                        jobsArray[start].findElement(By.xpath('//article[@id="result-' + appartId + '"]//button[contains(@class, "is24-icon-heart-Favorite-glyph")]')).then(fav => {

                            console.log('In favorite. Go to the next');
                            self.selectApart(++start);

                        }, function(error) {

                            console.log('Not in favorite');

                            jobsArray[start].findElement(By.css('a.result-list-entry__brand-title-container')).then(btn => {
                    
                                self.driver.executeScript("arguments[0].click();", btn).then(function() {
                    
                                    self.driver.wait(until.urlContains('/expose/'), 3000).then(function() {
                                        self.sendRequest(start);
                                    });

                                }, function(error) {
                                    console.log('Apart link not clickable');
                                });

                            }, function(error) {
                                console.log('Can\'t find apart link in search results by css - a.result-list-entry__brand-title-container');
                            });

                        });
                    }, function(error) {
                        console.log('Can\'t find element by css - a.result-list-entry__brand-title-container');
                        self.selectApart(++start);
                    });
                } else {

                    console.log("Start waiting 5 minutes");

                    self.driver.sleep(300000).then(function() {

                        console.log("End waiting");
                        self.findNewAparts(0);
            
                    });

                }
            }, function(error) {
                console.log('Can\'t find elements by css - .result-list-entry__data-container');
            });
        }, function(error) {
            console.log('List not found by xpath - //ul[@id="resultListItems"]');
        });
    },
    sendRequest: function(start) {

        const self = this;
        const requestLink = By.xpath('//div[@id="is24-expose-contact-box"]//a[contains(@class, "button-primary")]');

        self.driver.findElement(requestLink).then(btn => {
                    
            self.driver.executeScript("arguments[0].click();", btn).then(function() {

                const sendBtn = By.xpath('//div[@id="is24-expose-modal"]//div[contains(@class, "contentContainer")]//button[contains(@class, "button-primary")]');

                self.driver.wait(until.elementLocated(sendBtn), 3000).then(function() {

                    const textarea = By.xpath('//textarea[@id="contactForm-Message"]');

                    self.driver.wait(until.elementLocated(textarea), 3000).then(async function() {

                        var text = fs.readFileSync('./data/message.txt', 'utf8');

                        //console.log(text);

                        await self.driver.findElement(textarea).sendKeys(Key.BACK_SPACE);
                        await self.driver.findElement(textarea).sendKeys(text);

                        self.driver.sleep(3000).then(function() {

                            self.driver.findElement(sendBtn).then(sbtn => {
                        
                                self.driver.executeScript("arguments[0].click();", sbtn).then(function() {
        
                                    self.driver.sleep(3000).then(function() {
                                        self.driver.navigate().back().then(self.findNewAparts(start++));
                                    });
                                
                                });
        
                            });
                
                        });

                    }, function(error) {
                        console.log('Can\'t find textarea by xpath - //textarea[@id="contactForm-Message"]');
                    });

                }, function(error) {
                    console.log('Can\'t find send button by xpath - //div[@id="is24-expose-modal"]//div[contains(@class, "contentContainer")]//button[contains(@class, "button-primary")]');
                });

            }, function(error) {
                console.log('Request link not clickable');
            });

        }, function(error) {
            console.log('Can\'t find request link on detail page by xpath - //div[@id="is24-expose-contact-box"]//a[contains(@class, "button-primary")]');
        });

    }
}

module.exports = applyApart;