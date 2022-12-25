const axios = require('axios') 
const cheerio = require('cheerio');
const express = require ('express')
const app = express();
const Datastore = require('nedb')
app.use(express.static('public'))
const database = new Datastore('database.db');
database.loadDatabase();
const PORT = 3001;
app.listen(PORT, () => {
    console.log('Serveren er aktiv på port: '+PORT)
    console.log('*******************************')
})


let search = ['audi', 'mercedes', 'bmw', 'maserati']
for(let i=1; i<=100; i++){
async function getBooks(){
    try{
        const siteUrl = 'https://www.dba.dk/soeg/side-'+i+'/?soeg='+search[0]+''
        
        const { data } = await axios({
            method: "GET",
            url: siteUrl,
        })
        
        const $ = cheerio.load(data);

        const elemSelector = '#content > div.sidebar-layout > section > table > tbody > tr'


        const bookArr = []


        $(elemSelector).each((parentIdx, parentElem) => { //her målretter vi hver 
            let books = $(parentElem).html()
            

            let title = $('td.mainContent > div > a', $(parentElem).html()).text().trim().replace('\n', ' ')
            let place = $('td.mainContent > ul > li:nth-child(2) > span', $(parentElem).html()).text().trim().replace('\n', ' ') //.trim() fjerne mellemrum i consollen
            
            let pric = $('td:nth-child(4)', $(parentElem).html()).text().trim().replace('\n', ' ')
            let pricey = pric.slice(0, -4)
            let price = pricey.replace('.', '')

            let lastIndex = $('td.mainContent', $(parentElem).html()).text().lastIndexOf('https://billeder.dba.dk')
            let img = $('td.mainContent', $(parentElem).html()).text().substring(lastIndex)

            //Advanced array finding
            let lastIndex2 = $('td.mainContent', $(parentElem).html()).text().lastIndexOf('https://www.dba.dk/')
            let url1 = $('td.mainContent', $(parentElem).html()).text().substring(lastIndex2)
            let lastIndex3 = $('td.mainContent', $(parentElem).html()).text().search(',\n')
            let urls = url1.slice(0, lastIndex3)
            let urltrim = urls.trim()
            let url = urltrim.slice(0, urltrim.length-2)
            
           

            let bookObj = {}

        
            let data = {title,
                        price,
                        place,
                        img, 
                        url}
                        

            if(title){
                bookObj = {title, price, place, img, url}
            }
            bookArr.push(bookObj)
        })
        
        return bookArr
    }catch(error){
        console.error(error)
    }
}
getBooks();


app.get('/api/books'+i, async (req, res) => {
    try{
    const booksPrice = await getBooks()
    return res.status(200).json({
        result: booksPrice
    })
    } catch(err) {
        return res.status(200).json({
            err: err.toString(),
        })
    }
})
}

app.get('/api/all', (request, response) => {
    database.find({}, (err, data) => {
        response.json(data)
    })
})