var Crawler = require("node-webcrawler");
var fs = require('fs');

var SONGS_JSON_PATH = 'songs.json';
var DOMAIN = 'https://incompetech.com';

var songs = [];
var amount_songs_crawled = 0;
var total_songs_to_crawl;

var songCrawler = new Crawler({
    maxConnections: 10,
    callback: function (error, result, $) {
        if (error) return;

        amount_songs_crawled += 1;
        console.log((amount_songs_crawled/total_songs_to_crawl * 100).toFixed(2) + "%");

        var songId = this.uri.match(/USUAN\d+/);

        var songNode = $('.expansion-container').children().first().children().first();
        var downloadUrl = DOMAIN + songNode.children().first().attr('href');

        var nameNode = songNode.next().children().first();
        var name = nameNode.children().first().text().replace(/"/g, '');

        var instrumentsNode = nameNode.next();
        var instruments = instrumentsNode.children().first().text().split(', ');

        var feelingsNode = instrumentsNode.next();
        var feelings = feelingsNode.children().first().text().split(', ');

        var descriptionNode = feelingsNode.next();
        var description = descriptionNode.text();

        var bpmNode = $('.expansion-container').parent().next();
        var bpm = bpmNode.text().replace(' bpm', '');

        var genreNode = bpmNode.next();
        var genre = genreNode.text();

        var lengthNode = genreNode.next();
        var length = lengthNode.text();

        songs.push({
            songId: songId,
            name: name,
            instruments: instruments,
            feelings: feelings,
            bpm: bpm,
            genre: genre,
            length: length,
            url: downloadUrl,
            description: description
        })
    },
    onDrain: function (pool) {
        console.log("Done. Downloaded " + songs.length + " of " + total_songs_to_crawl + ".");

        fs.writeFile(
            SONGS_JSON_PATH,
            JSON.stringify(songs),
            function (err) {
                if (err)
                    console.error("Error: Could not save songs to json.");
                else
                    console.log("Songs saved to '" + SONGS_JSON_PATH + "' file");
            }
        )
    }
});

var songsListCrawler = new Crawler({
    maxConnections: 10,
    callback: function (error, result, $) {
        $("#wrapper").children('p').first().children('a').each(function (i, element) {
            var url = $(this).attr('href');
            songCrawler.queue(DOMAIN + url)
        });

        total_songs_to_crawl = $("#wrapper").children('p').first().children('a').length;
    }
});

songsListCrawler.queue('https://incompetech.com/music/royalty-free/full_list.php');
