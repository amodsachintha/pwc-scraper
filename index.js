const rp = require('request-promise');
const otcsv = require('objects-to-csv');
const $ = require('cheerio');
const fs = require('fs');

const baseURL = 'http://www.hitad.lk/EN';
const propertyURL = '/property?page=';

const getAds = (page) => {
    return rp(baseURL + propertyURL + page).then((html) => {
        return $('ul.cat-ads.topseelerimg', html).map((i, e) => {
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
    }).catch(e => {
        console.log("-----------Error-----------");
    })
};

const saveAsJSON = (data) => {
    fs.writeFile("./all.json", JSON.stringify(data), (err) => {
        if (err) {
            console.error(err);
        }
    });
};

const saveAsCSV = (data, i) => {
    const transformed = new otcsv(data);
    transformed.toDisk('./out/out_' + i + '.csv');
};


let arr = [];
let asyncsLeft = 0;
for (let i = 1; i <= 1000; i++) {
    asyncsLeft++;
    console.log('Requesting page ' + i);
    getAds(i).then((data) => {
        console.log('Got page ' + i);
        arr.push(...data);
        if (--asyncsLeft === 0) {
            console.log(arr.length);
            saveAsJSON(arr);
            console.log('Done!')
        }
    }).catch(e => {
        console.log('Error____');
        if (--asyncsLeft === 0) {
            console.log(arr.length);
            saveAsJSON(arr);
            console.log('Done!')
        }
    });
}