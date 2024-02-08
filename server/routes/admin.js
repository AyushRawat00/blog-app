const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');       //for excypting & decrypting the password
const jwt = require('jsonwebtoken');    //token based validation
const Post = require('../models/Post');
const User = require('../models/User');

const adminLayout = '../views/layouts/admin';   //to include adminLayout in the page
const jwtSecret = process.env.JWT_SECRET;

const authMiddleware = (req, res, next ) => { //it is important to terminate the user login whenever the cookie is deleted/terminated
    const token = req.cookies.token;
    if(!token) { return res.status(401).json( { message: 'Unauthorized'} );
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    }catch (error) {   console.log(error); }
}

router.get('/admin', async (req, res) => {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }
    try {res.render('admin/index', { locals, layout: adminLayout });     //had to explicitly define layout i.e. adminLayout as specified in line9
    }
    catch (error) {   console.log(error); }
});

router.post('/admin', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) { return res.status(401).json({ message: 'Invalid credentials' }); }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) { return res.status(401).json({ message: 'Invalid credentials' }); }
        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });
        // cookie is important because it helps to keep the user logged in through its usage
        // to track of the multiple users cookie, JWToken is implemented which stores the  user._id
        res.redirect('/dashboard');
    }catch (error) { console.log(error); }
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        try {
            const user = await User.create({ username, password:hashedPassword });
            res.status(201).json({ message: 'User Created', user });
        }
        catch (error) {
            if(error.code === 11000) { res.status(409).json({ message: 'User already in use'}); }
            res.status(500).json({ message: 'Internal server error'})
        }
    }catch (error) {   console.log(error); }
});

router.get('/dashboard', authMiddleware, async (req, res) => {
    const locals = {
        title: 'Dashboard',
        description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }// middleware will kill the session whenever cookie isn't available
    try {
        const data = await Post.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        });
    }catch (error) {   console.log(error); }
});

router.get('/add-post', authMiddleware, async (req, res) => {
    const locals = {
        title: 'Add Post',
        description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }
    try {
        res.render('admin/add-post', {
            locals,
            layout: adminLayout
        });
    }catch (error) {   console.log(error); }
});

router.post('/add-post', authMiddleware, async (req, res) => {
    const newPost = new Post({title: req.body.title, body: req.body.body});
    try {
        try {
            await Post.create(newPost);
            res.redirect('/dashboard');
        } catch (error) {   console.log(error); }
    } catch (error) {   console.log(error); }
});

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    const locals = {
      title: "Edit Post",
      description: "Free NodeJs User Management System",
    };
    try {
        const data = await Post.findOne({ _id: req.params.id });
        res.render('admin/edit-post', {
            locals,
            data,
            layout: adminLayout
        })
    }catch (error) {   console.log(error); }
});

router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });
        res.redirect(`/edit-post/${req.params.id}`);
    }catch (error) {   console.log(error); }
});

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne( { _id: req.params.id } );
        res.redirect('/dashboard');
    }catch (error) {   console.log(error); }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

module.exports = router;