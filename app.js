const express = require('express')
const app = express()
const port = 3000
const exphbs = require('express-handlebars')
const movieList = require('./movies.json')

// setting template engine

// app.engine：透過這個方法來定義要使用的樣板引擎，其中
// 第1個參數是這個樣板引擎的名稱
// 第2個參數是放入和此樣板引擎相關的設定。這裡設定了預設的佈局（default layout）需使用名為 main 
// 的檔案。稍後我們再來建立這支 main 檔案，並說明佈局的概念。
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))

// app.set：透過這個方法告訴 Express 說要設定的 view engine 是 handlebars
app.set('view engine', 'handlebars')

// 在同一個網站內，幾乎每一個頁面都會套用的版型，就稱作佈局(Layout)
// 而在不同頁面會有不同內容的地方，我們就稱作「局部樣板 (partial template)」
// 如此就可以快速套用相同的佈局，但又能針對不同的頁面調整內容：
// 依照 handlebars 的規範，首先我們需要建立一個名為 views 的資料夾，並在 views 資料夾中，再新增/// 一個名為 layouts 的資料夾, 然後: 
// 把 layout 的部分放在 layouts 資料夾中
//     在 layouts 這個資料夾中，先建立一支名為 main.handlebars 的檔案。在這個檔案裡，我們就可
//     以開始撰寫網頁佈局的部分
//     接著，因為每一頁都會有相同的導覽列（navigation），因此我們可以把導覽列一樣放在 
//     main.handlebars 中
// 把 partial template 的部分放在 views 這個資料夾中

// setting static files
app.use(express.static('public'))


app.get('/', (req, res) => {
    // 把原本的 res.send() 改成 res.render('index')後，Express 就會在使用者輸入 
    // localhost:3000 進到根目錄時，根據 index.handlebars 這支檔案回傳對應的 HTML


    // pass the movie data into 'index' partial template
    // movies.json 檔案中，陣列是包在 results 屬性內，所以此時要被傳到樣板引擎當中的資料，會是 movieList.results
    res.render('index', { movies: movieList.results })
})

app.get('/search', (req, res) => {
    // 在 Express 的路由中，除了可以透過 req.params 來取得路由上的資訊，還可以透過 req.query 這個物件存取網頁網址中 ? 後的內容
    // 在網址列中 ? 後面的內容，稱作「查詢字串」（queryString), 可以讓伺服器知道你是從哪個管道進到這個網站、或是從哪裡分享出這篇文章。許多導購的網頁、分享資訊的媒體網站都會在網頁中發入 queryString
    console.log('req.query', req.query)
    const keyword = req.query.keyword

    // 如果要查詢某一字串中是否包含特定字串，則可以使用 includes 這個方法。當某一字串內的包含特定字串內容時，就會得到 true，否則得到 false. 舉例來說: 
    // const str = 'JavaScript is a popular language'
    // console.log(str.includes('JavaScript'))   // true
    // console.log(str.includes('javascript'))   // false
    // 特別注意的是 includes 這個方法在比對字串時，會區分大小寫，所以當比對的字串大小寫不同時，就會得到 false
    // 要把字串轉換成小寫很容易，在 JavaScript 中已經提供了 toLowerCase() 的方法可以直接使用。因此，只需要將被轉換成小寫的電影名稱 movie.title.toLowerCase() ，和也被轉換成小寫的搜尋關鍵字 keyword.toLowerCase() 兩兩透過 includes 比對就可以了
    const movies = movieList.results.filter(movie => {
        return movie.title.toLowerCase().includes(keyword.toLowerCase())
    })

    // 把透過網址取得的 keyword 再傳回到模板引擎中，也就是透過 res.render('index', { movies: movies, keyword: keyword }
    res.render('index', { movies: movies, keyword: keyword })
})

app.get('/movies/:movie_id', (req, res) => {
    console.log('req.params.movie_id', req.params.movie_id)
    // const movie = movieList.results.filter(movie => movie.id == req.params.movie_id)
    const movie = movieList.results.find(movie => movie.id.toString() === req.params.movie_id)
    // 在判斷 movie.id 是否等於 req.params.movie_id 時，在教學影片裡我們使用兩個等號（==）而不是三個等號（===），是因為使用三個等號時，在等號前後兩者的型別必須一樣才會成立。在這裡，雖然透過 movie.json 取得的 movie.id 和透過路由得到的 req.params.movie_id 這兩者看起來都是數字，但是實際上 movie.id 是數值（Number），而路由傳過來的 req.params.movie_id 則是字串（String) 。

    // 但是使用 JavaScript 時採用三個等號 === 是比較好的作法，因為 == 會忽略型別的判斷，只要值相同就會得到 true；而 === 是不論值或型別都要相同才會得到 true，因此一般來說，為了避免碰到因型別而導致的意外錯誤，減少錯誤產生的機會，建議還是都使用 === 來作為判斷的方式。
    // 所以更好的方法，是先把 movie.id 先透過.toSting() 轉換成字串，再使用 === 跟 req.params.movie_id 比較。
    // 你可能會想到另一個方法，就是 movie.id === Number(req.params.movie_id) 。這個方法的確比使用 == 好，但是還是會有一個瑕疵，也就是當 req.params.movie_id 是空字串時（沒有選擇電影的時候），movie.id 為 0 的電影是會被錯誤取出來，因為 Number(null) 等於零。

    // 用 find() 取代 filter()
    // 使用 filter() 的時候一般是因為我們需要尋找多個元素，因為 filter() 會回傳一個陣列。但因為 movie.id 是不重複的，所以我們每次只會找到唯一有相同 movid.id 的電影。這個時候，使用 find 會更適合，我們也可以直接回傳 movie 而不是 movie[0]，讓程式碼變得更簡潔。

    res.render('show', { movie: movie })
})

app.listen(port, () => {
    console.log(`Express is running on http://localhost:${port}`)
})