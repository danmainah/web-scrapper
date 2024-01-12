const User = require('../models/userModel')
const Content = require('../models/contentModel')
const cheerio = require('cheerio')
const axios = require('axios')
exports.getContent = async (req, res) => {
  const data = await Content.find({});
  //filter the content to dislay content that belongs to the logged in user
  const id = req.session.userId;
  const content = data.filter(content => content.author.toString() === id);
  res.render('index', { content });
};

exports.scrape = async (req, res) => {
  const {title, url} = req.body;
  const id = req.session.userId;
  let scrapped = [];

  if(!title || !url) {
    return res.status(400).send({ error: 'Please provide a title and URL.' });
  }

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    $('table tr').each((index, element) => {
      const tds = $(element).find('td');
      const tableRow = {};
      $(tds).each((i, el) => {
        // Adjust this to match the structure of your table
        tableRow[`property${i}`] = $(el).text();
      });
      scrapped.push(tableRow);
    });
    console.log(scrapped);
  }
  catch (error) {
    return res.status(500).send({ error: 'An error occurred while scraping.' });
  }

  try {
    // Save the scrapped data
    const content = new Content({
      title: req.body.title,
      data: scrapped,
      author: id,
    });

    await content.save();
    
    // Add content to user posts array
    await User.findOneAndUpdate(
      { _id: id },
      { $push: { Contents: content } },
    )

    // Redirect after successful save
    res.redirect('./');
  } catch (err) {
    // Handle error
    console.error(err);
    res.status(500).send('An error occurred while saving the scrapped data + ' + err);
  }
}

exports.getScrapped = async (req, res) => {
  const filter = { title: req.params.title };
  const content = await Content.findOne( filter);
  console.log(content);
  res.render('content/view', { content });
};

exports.editScrappedGet = async (req, res) => {
  const filter = { title: req.params.title };
  // Check if the content belongs to the logged in user before delete
  const id = req.session.userId;
  const contentAuthor = await Content.findOne( filter);
  if(contentAuthor.author.toString() !== id) {
    return res.status(401).send('<h3>You are not authorized to edit this content.</h3><a href="../">Back</a>');
  }
  const content = await Content.findOne( filter);
  res.render('content/edit', {content} )
}

exports.editScrappedPost = async (req, res) => {
  const { title, data } = req.body;

  try {
    // Find the document by title and update it with the new title or data
    const updatedContent = await Content.findOneAndUpdate(
      { title: title },
      { $set: { title: title, data: data } },
      { new: true }
    );

    res.redirect(`/content/view/${updatedContent.title}`);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.deleteScrapped = async (req, res) => {
  const filter = { title: req.params.title };
  // Check if the content belongs to the logged in user before delete
  const id = req.session.userId;
  const contentAuthor = await Content.findOne( filter);
  if(contentAuthor.author.toString() !== id) {
    return res.status(401).send('<h3>You are not authorized to delete this content.</h3><a href="../">Back</a>');
  }
  
  const content = await Content.findOneAndDelete( filter);
  console.log(content);
  res.redirect('../');
}