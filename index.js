const express = require("express");
const mysql = require("mysql");
const app = express();
const pool = require("./dbPool");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

//routes
app.get('/', (req, res) => {
   res.render('index')
});

app.get("/author/new", (req, res) => {
  res.render("newAuthor");
});

app.get("/quote/new", async (req, res) => {
  let sqlAuthor = 'SELECT authorId, firstName, lastName FROM q_authors ORDER BY lastName';
  let sqlCategory = 'SELECT DISTINCT category FROM q_quotes ORDER BY category';
  let rowsAuthor = await executeSQL(sqlAuthor);
  let rowsCategory = await executeSQL(sqlCategory);
  res.render("newQuote", {"author": rowsAuthor, "category": rowsCategory});
});

app.post("/author/new", async function(req, res){
  let fName = req.body.fName;
  let lName = req.body.lName;
  let birthDate = req.body.birthDate;
  let deathDate = req.body.deathDate;
  let sex = req.body.sex;
  let profession = req.body.profession;
  let country = req.body.country;
  let portrait = req.body.portrait;
  let biography = req.body.biography;
  let sql = "INSERT INTO q_authors (firstName, lastName, dob, dod, sex, profession, country, portrait, biography) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);"
  let params = [fName, lName, birthDate, deathDate, sex, profession, country, portrait, biography];
  let rows = await executeSQL(sql, params);
  res.render("newAuthor", {"message": "Author added!"});
});

app.post("/quote/new", async function(req, res){
  let authorId = req.body.author;
  let category = req.body.category;
  let quote = req.body.quote;
  let likes = req.body.likes;
  let sql = "INSERT INTO q_quotes (authorId, category, quote, likes) VALUES (?, ?, ?, ?);"
  let params = [authorId, category, quote, likes];
  let rows = await executeSQL(sql, params);
  let sqlAuthor = 'SELECT authorId, firstName, lastName FROM q_authors ORDER BY lastName';
  let sqlCategory = 'SELECT DISTINCT category FROM q_quotes ORDER BY category';
  let rowsAuthor = await executeSQL(sqlAuthor);
  let rowsCategory = await executeSQL(sqlCategory);
  res.render("newQuote", {"message": "Quote added!", "author": rowsAuthor, "category": rowsCategory });
});

app.get("/authors", async function(req, res){
 let sql = `SELECT *
            FROM q_authors
            ORDER BY lastName`;
 let rows = await executeSQL(sql);
 res.render("authorList", {"authors":rows});
});

app.get("/quotes", async function(req, res) {
   let sql = `SELECT quoteId, quote, 
             authorId, firstName, 
             lastName, category, likes
             FROM q_quotes
             NATURAL JOIN q_authors
             ORDER BY lastName`
   let rows = await executeSQL(sql);
   res.render("quoteList", {"quotes":rows});
});

app.get("/author/edit", async function(req, res){
 let authorId = req.query.authorId;
 let sql = `SELECT *, DATE_FORMAT(dob, '%Y-%m-%d') dobISO, 
            DATE_FORMAT(dod, '%Y-%m-%d') dodISO
            FROM q_authors
            WHERE authorId =  ${authorId}`;
 let rows = await executeSQL(sql);
 res.render("editAuthor", {"authorInfo":rows});
});

app.get("/quote/edit", async function(req, res) {
   let quoteId = req.query.quoteId;
   let sql = `SELECT quoteId, quote, 
             authorId, firstName, 
             lastName, category, likes
             FROM q_quotes
             NATURAL JOIN q_authors
             WHERE quoteId = ${quoteId}`;
   let rows = await executeSQL(sql);
   let sqlCategory = 'SELECT DISTINCT category FROM q_quotes ORDER BY category';
   let rowsCategory = await executeSQL(sqlCategory);
   let sqlAuthor = 'SELECT DISTINCT authorId, firstName, lastName FROM q_authors ORDER BY lastName';
   let rowsAuthor = await executeSQL(sqlAuthor);
   res.render("editQuote", {"quoteInfo":rows, "category":rowsCategory, "author":rowsAuthor});
});

app.post("/author/edit", async function(req, res){
 let sql = `UPDATE q_authors
            SET firstName = ?,
               lastName = ?,
               dob = ?,
               dod = ?,
               sex = ?,
               profession = ?,
               country = ?,
               portrait = ?,
               biography = ?
            WHERE authorId =  ?`;
let params = [req.body.fName,  
              req.body.lName, req.body.dob,
              req.body.dod,
              req.body.sex,
              req.body.profession,
              req.body.country,
              req.body.portrait,
              req.body.biography,
              req.body.authorId];         
let rows = await executeSQL(sql,params);
sql = `SELECT *, 
        DATE_FORMAT(dob, '%Y-%m-%d') dobISO, 
        DATE_FORMAT(dod, '%Y-%m-%d') dodISO
        FROM q_authors
        WHERE authorId= ${req.body.authorId}`;
 rows = await executeSQL(sql);
 res.render("editAuthor", {"authorInfo":rows, "message": "Author Updated!"});
});

app.post("/quote/edit", async function(req, res) {
   let quoteId = req.body.quoteId;
   console.log("quoteId: " + quoteId);
   let sql = `UPDATE q_quotes
             SET quote = ?,
               category = ?,
               likes = ?,
               authorId = ?
             WHERE quoteId =  ?`;
   let params = [req.body.quote, req.body.category, req.body.likes, req.body.author, req.body.quoteId];
   let rows = await executeSQL(sql, params);
   sql = `SELECT quoteId, quote, 
    authorId, firstName, 
    lastName, category, likes
    FROM q_quotes
    NATURAL JOIN q_authors
    WHERE quoteId = ${quoteId}`;
   rows = await executeSQL(sql);
   let sqlCategory = 'SELECT DISTINCT category FROM q_quotes ORDER BY category';
   let rowsCategory = await executeSQL(sqlCategory);
   let sqlAuthor = 'SELECT DISTINCT authorId, firstName, lastName FROM q_authors ORDER BY lastName';
   let rowsAuthor = await executeSQL(sqlAuthor);
   res.render("editQuote", {"quoteInfo":rows, "category":rowsCategory, "message": "Quote Updated!", "author":rowsAuthor});
});

app.get("/author/delete", async function(req, res) {
   let sql = `DELETE
             FROM q_authors
             WHERE authorId = ${req.query.authorId}`;
   let rows = await executeSQL(sql);
   res.redirect("/authors");
});

app.get("/quote/delete", async function(req, res) {
   let sql = `DELETE
             FROM q_quotes
             WHERE quoteId = ${req.query.quoteId}`;
   let rows = await executeSQL(sql);
   res.redirect("/quotes");
});

app.get("/dbTest", async function(req, res){
   let sql = "SELECT CURDATE()";
   let rows = await executeSQL(sql);
   res.send(rows);
});//dbTest

app.get("/api/authors", async function(req, res) {
   let sql = 'SELECT * FROM q_authors';
   let rows = await executeSQL(sql);
   res.send(rows);
})

//functions
async function executeSQL(sql, params){
   return new Promise (function (resolve, reject) {
      pool.query(sql, params, function (err, rows, fields) {
      if (err) throw err;
         resolve(rows);
      });
   });
}//executeSQL


//start server
app.listen(3000, () => {
   console.log("Expresss server running...")
} )

