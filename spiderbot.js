const axios = require("axios"),
    cheerio = require("cheerio"),
    randomUserAgent = require('random-useragent'),
    {Link} = require('./Link'),
    fetch = require('node-fetch'),
    util = require('util'),
    sleep = util.promisify(setTimeout)

async function findAllLinks(url, linkArr, currDepth, visited){
    let page = await axios.get(url, 
        { 
            headers:{
                'User-Agent': randomUserAgent.getRandom() 
            }
        }).catch(err=> { throw err})
        const $ = cheerio.load(page.data)
        const anchors = $('a')
        // Getting titles, headings and bold texts //
        const pageTitle = $('title');
        let keywords = ""
        if($('meta[name="keywords"]').attr('content')!=undefined) keywords = $('meta[name="keywords"]').attr('content')

        let meta = {
            keywords,
            description : $('meta[name="description"]').attr('content')
        }
        let index = {
            title: $('title').text(),
            meta
        }
        console.log(index)
        let count = 0
        $(anchors).each(function(i, anchor){
            let string = $(anchor).attr('href')
            if(string){
                if(string[0]=='/') string = url + $(anchor).attr('href')
                if(visited[string]!=1 && string!='#' && !(string.includes("facebook.com") || string.includes("twitter.com") || string.includes("instagram.com")) ){
                    linkArr.push(new Link(string, currDepth+1))
                    visited[string] = 1
                    count++
                }
            }
        });
        console.log('Total links found for '+ url +" : "+count)
    
}
const display = (links)=>{
    // display the links
    links.forEach(link=>{
        console.log(link)
    })
}
async function crawlBFS(){
    let Urls = ["https://edition.cnn.com/"]
    let pendingLinks = []
    pendingLinks.push(new Link(Urls[0], 0))
    let visited = []
    visited[Urls[0]] = 1
    let max_depth = 3
    while(pendingLinks.length!=0 ){
        
            let linkObj = pendingLinks.shift()
            let currDepth = linkObj.depth
            let url = linkObj.url
            if(url[url.length-1]=='/') url = url.slice(0, url.length-1)

            // craw if the url is not visited
            
            if(visited[url]!=1 && currDepth < max_depth){
                console.log(`Crawling : ${url} at depth ${currDepth}`)
                await findAllLinks(url, pendingLinks, currDepth, visited)
                .catch(err=>{
                    console.log("Error : " + err.code)
                })
            }
            let minWait = 500
            let maxWait = 2000
            let waitTime = Math.floor((Math.random() * maxWait) + minWait)
            await sleep(waitTime)
    }
    display(pendingLinks)
    console.log(visited)
}

crawlBFS()
