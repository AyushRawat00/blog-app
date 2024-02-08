const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.get('/', async (req, res) => {
    const locals = {
      title: "Home",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }
    try {
        let perPage = 7;
        let page = req.query.page || 1;
        
        const data = await Post.find({})
        .sort({createdAt:-1})
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();
    
        const count = await Post.count();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
        
        res.render('index', { 
          locals,
          data,
          // current: page,
          nextPage: hasNextPage ? nextPage : null,
          currentRoute: '/'
        });
      } 
      catch (error) { console.log(error); }
});

router.get('/post/:id', async (req, res) => {
  try {
    const data = await Post.findById({ _id: req.params.id });
    const locals = {
      title: data.title,
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    }
    
      res.render('post', { 
        locals,
        data,
        currentRoute: `/post/${req.params.id}`
      });
    }
    catch (error) { console.log(error); }  
});

router.post('/search', async (req, res) => {
    const locals = {
        title: "Search",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
    }
    try {
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
            ]
        });
        res.render("search", {
            data,
            locals,
            currentRoute: '/search'
        });
    }
    catch (error) { console.log(error); }
});

router.get('/about', async (req, res) => {
  const locals = {
    title: "About",
    description: "Simple Blog created with NodeJs, Express & MongoDb."
  }
  res.render('about', {
    locals,
    currentRoute: '/about'
  });
});

router.get('/contact', async (req, res) => {
  const locals = {
    title: "Contact",
    description: "Simple Blog created with NodeJs, Express & MongoDb."
  }
  res.render('contact', {
    locals,
    currentRoute: '/contact'
  });
});

module.exports = router;
// function insertPostData () { Post.insertMany([{ title: " ", body: " " }, { title: " ", body: " " }, { title: " ", body: " " }, { title: " ", body: " " }])}
// insertPostData();