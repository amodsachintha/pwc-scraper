const rp = require('request-promise');
const otcsv = require('objects-to-csv');
const $ = require('cheerio');
const fs = require('fs');

const baseURL = 'http://www.hitad.lk/EN';
const propertyURL = '/property?page=';

const getAds = (page) => {
    rp(baseURL + propertyURL + page).then((html) => {
        let map = $('ul.cat-ads.topseelerimg', html).map((i, e) => {
            let thumb_url = $('img.img-responsive', e).prop('src');
            let url = $('div.col-lg-12.clearfix', e).children('a').prop('href');
            let title = $('div.col-lg-12.clearfix', e).children('a').children('h4').text();
            title = title.replace(/[\t\n]/g, '');
            let price = $('span.list-price-value', e).text();
            let location = $('div.item-facets2', e).children().remove().end().text().split('\t')[0];
            return {
                url,
                thumb_url,
                title,
                location,
                price
            };
        }).get();
        console.log('Request ' + page + ' Complete! Writing data disk.');
        saveAsJSON(map, page);
        console.log('Page ' + page + ' done');
    }).catch(e => {
        console.log(e);
    })
};

const saveAsJSON = (data, i) => {
    fs.writeFile("./out/json_" + i + ".json", JSON.stringify(data), (err) => {
        if (err) {
            console.error(err);
        }
    });
};

function saveAsCSV(data, i) {
    const transformed = new otcsv(data);
    transformed.toDisk('./out/out_' + i + '.csv');
}

for (let i = 1; i < 10; i++) {
    getAds(i);
}
